<?php
namespace MinistryPlatform;
/**
 * Plugin Name: Ministry Platform Data Access
 * Description: A wordpress plugin wrapper for accessing Ministry Platform
 * utilizing the the ministry platform API
 * Version: 2.1.0
 */

use MinistryPlatform\Templates\featuredEvents;
use MinistryPlatform\Templates\featuredEventsWithDate;
use MinistryPlatform\Templates\eventDetails;
use MinistryPlatformAPI\MinistryPlatformTableAPI as MP;

// Setup autoloading of supporting classes
require_once __DIR__ . '/vendor/autoload.php';


// Load the configuration for the admin menu and supporting environment functions
require_once('MP_Admin_Menu.php');
mpLoadConnectionParameters();

/* This is where you put your wonderful code to build your shortcodes  */
add_shortcode('mpapi_feature_events', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_featured_events_sc']);
add_shortcode('mpapi_event_details', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_event_details_sc']);
add_shortcode('mpapi_nextsteps', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_nextsteps_sc']);
add_shortcode('mpapi_baptism', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_baptism_sc']);
add_shortcode('mpapi_debug_test', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_debug_test_sc']);
add_shortcode('mpapi_participant_milestones', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_participant_milestones_sc']);


add_shortcode('mpapi_token_name', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_token_name_sc']);
add_shortcode('mpapi_family_certificates', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_family_certificates_sc']); // Not used directly

add_shortcode('mpapi_login', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_login_sc']);

// add_shortcode('mpapi_search_groups', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_search_groups_sc']);
add_action('wp_ajax_mpapi_search_groups_ajax', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_search_groups_ajax']);
add_action('wp_ajax_nopriv_mpapi_search_groups_ajax', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_search_groups_ajax']);


add_action('wp_ajax_mpapi_get_campuses', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_get_campuses']);
add_action('wp_ajax_nopriv_mpapi_get_campuses', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_get_campuses']);


add_action('wp_ajax_mpapi_search_events_ajax', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_search_events_ajax']);
add_action('wp_ajax_nopriv_mpapi_search_events_ajax', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_search_events_ajax']);

add_action('wp_ajax_hashTagEvents', ['MinistryPlatform\MP_API_SHORTCODES', 'hashTagEvents']);
add_shortcode('hashTagEvents', ['MinistryPlatform\MP_API_SHORTCODES', 'hashTagEvents']); // Not used directly
add_shortcode('hashTagEventsCheck', ['MinistryPlatform\MP_API_SHORTCODES', 'hashTagEventsCheck']); // Not used directly


class MP_API_SHORTCODES
{
    /**
     * Shortcode that will pull featured events for the home page
     *
     * @param array $atts
     * @param null $content
     * @return null|string
     */
    public static function mpapi_featured_events_sc($atts = [], $content = null)
    {
        $mp = new MP();

        // Authenticate to get access token required for API calls
        if ($mp->authenticate()) {

            $events = $mp->table('Events')
                ->select("Event_ID, Event_Title, Event_Start_Date, Meeting_Instructions, Event_End_Date, Location_ID_Table.[Location_Name], dp_fileUniqueId AS Image_ID")
                ->filter('((Events.Event_Start_Date between dateadd(minute,-60,getdate()) and dateadd(day, 30, getdate())) OR (Events.Featured_Event_Date < getdate() and Events.Event_Start_Date >= getdate())) AND Featured_On_Calendar = 1 and Visibility_Level_ID_Table.[Visibility_Level_ID] = 4 AND Event_Type_ID_Table.[Event_Type_ID] IN (1,14,19,21) AND Events.[_Approved] = 1 AND ISNULL(Events.[Cancelled], 0) = 0')
                ->orderBy('Event_Start_Date')
                ->get();

            $content = featuredEvents::render($events);
        }
        // always return
        return $content;
    }

    /**
     * Shortcode that will pull event details for a given event
     *
     * @param array $atts
     * @param null $content
     * @return null|string
     */
    public static function mpapi_event_details_sc($atts = [], $content = null)
    {
        $mp = new MP();

        // Authenticate to get access token required for API calls
        if ($mp->authenticate()) {
            $event = $mp->table('Events')
                ->select("Event_ID, Event_Title, Events.Meeting_Instructions, Events.Description, Event_Start_Date, Event_End_Date, External_Registration_URL, Featured_On_Calendar, Event_Type_ID_Table.[Event_Type],
                        Event_Type_ID_Table.[Event_Type_ID], Primary_Contact_Table.[Nickname], Primary_Contact_Table.[First_Name], Primary_Contact_Table.[Last_Name],
                        Primary_Contact_Table.[Email_Address], Visibility_Level_ID_Table.[Visibility_Level_ID], Location_ID_Table.[Location_Name],
                        Location_ID_Table_Address_ID_Table.[Address_Line_1], Location_ID_Table_Address_ID_Table.[Address_Line_2], Location_ID_Table_Address_ID_Table.[City],
                        Location_ID_Table_Address_ID_Table.[State/Region], Location_ID_Table_Address_ID_Table.[Postal_Code],
                        Registration_Active, Registration_Start, Registration_End, Online_Registration_Product, dp_fileUniqueId AS Image_ID")
                ->filter('Event_ID = ' . $_GET['id'])
                ->first();

            $opps = $mp->table('Opportunities')
                ->select("count(*) as [Opportunities]")
                ->filter("Add_To_Event = " . $event['Event_ID'])
                ->first();

            $event['Opportunities'] = $opps['Opportunities'];


            $content = eventDetails::render($event);
        }
        // always return
        return $content;

    }


    /**
     * Shortcode that will pull next step dates
     *  (beginning of configurable event query)
     *
     * @param array $atts
     * @param null  $content
     * @return null|string
     */
    public static function mpapi_nextsteps_sc($atts = [], $content = null)
    {
        $mp = new MP();

        // Authenticate to get access token required for API calls
        if ($mp->authenticate()) {
            $events = $mp->table('Events')
                ->select("Event_ID, Event_Title, Event_Start_Date, Event_End_Date, Location_ID_Table.[Location_Name], dp_fileUniqueId AS Image_ID")
                ->filter('(Events.Event_Start_Date between getdate() and dateadd(day, 60, getdate())) AND Event_Title like \'Next Steps%\' and Visibility_Level_ID_Table.[Visibility_Level_ID] = 4 AND Events.[_Approved] = 1 AND ISNULL(Events.[Cancelled], 0) = 0')
                ->orderBy('Event_Start_Date')
                ->get();

            $content = featuredEventsWithDate::render($events);
        }
        // always return
        return $content;

    }


    public static function mpapi_baptism_sc($atts = [], $content = null)
    {
        $mp = new MP();

        // Authenticate to get access token required for API calls
        if ($mp->authenticate()) {
            $events = $mp->table('Events')
                ->select("Event_ID, Event_Title, Event_Start_Date, Event_End_Date, Location_ID_Table.[Location_Name], dp_fileUniqueId AS Image_ID")
                ->filter("(getdate() between Events.Registration_Start AND Events.Registration_End) AND Event_Title like 'Believer%' and Visibility_Level_ID_Table.[Visibility_Level_ID] = 4 AND Events.[_Approved] = 1 AND ISNULL(Events.[Cancelled], 0) = 0")
                ->orderBy('Event_Start_Date')
                ->get();

            $content = featuredEventsWithDate::render($events);
        }
        // always return
        return $content;

    }


    public static function mpapi_debug_test_sc($atts = [], $content = null)
    {
        $mp = new MP();

        if ($mp->authenticate()) {
            return "<p style='color:green; font-weight:bold;'>✅ MinistryPlatform API Authentication Successful!</p>";
        } else {
            return "<p style='color:red; font-weight:bold;'>❌ MinistryPlatform API Authentication Failed!</p>";
        }
    }


    public static function mpapi_participant_milestones_sc($atts = [], $content = null)
    {
        $contactID = 265145; // You can modify this to dynamic later if needed

        $mp = new MP();
        if ($mp->authenticate()) {

            $family_data = $mp->table('Participant_Milestones')
                ->select('
        
        Participant_ID_Table_Contact_ID_Table.First_Name,
        Participant_ID_Table_Contact_ID_Table.Last_Name,
        Participant_Milestones.Date_Accomplished
        
    ')
                ->filter('
        Participant_ID_Table_Contact_ID_Table.Household_ID = 441009 AND
        Participant_Milestones.Milestone_ID = 214 AND
        Participant_Milestones.At_Prior_Church = 0
    ')
                ->orderBy('Participant_Milestones.Date_Accomplished DESC')
                ->get();

            // Fetch participant record
            $participant_record = $mp->table('Contacts')
                ->select('Contacts.Participant_Record')
                ->filter('Contacts.Contact_ID = ' . $contactID)
                ->get();

            $participant_record = is_array($participant_record) ? array_pop($participant_record) : null;

            if ($participant_record && $participant_record !== 'null') {
                // Fetch participant milestones
                $participant_milestones = $mp->table('Participant_Milestones')
                    ->select('*')
                    ->filter('Participant_Milestones.Milestone_ID = 214 AND Participant_Milestones.Participant_ID = ' . $participant_record['Participant_Record'])
                    ->get();

                $participant_milestones = is_array($participant_milestones) ? array_pop($participant_milestones) : null;
            } else {
                $participant_milestones = null;
            }

            ob_start();
            ?>
            <script>
                const familyData = <?php echo json_encode($family_data ?? []); ?>;
                // console.log("family_data:", <?php echo json_encode($family_data ?? []); ?>);
                // console.log("family_data length:", Array.isArray(familyData) ? familyData.length : 'Not an array');
                // console.log("contactID:", "<?php echo $contactID; ?>");
                // console.log("participant_record:", <?php echo json_encode($participant_record); ?>);
                // console.log("participant_milestones:", <?php echo json_encode($participant_milestones); ?>);
            </script>
            <?php
            return ob_get_clean();
        }
        return '';
    }

    public static function mpapi_family_certificates_sc($name = null)
    {
        $name = isset($_GET['contactId']) ? urldecode(sanitize_text_field($_GET['contactId'])) : null;

        if (!$name) {
            return '<p>No name provided in the URL.</p>';
        }


        $mp = new MP();

        // Final output string
        $output = '';

        if ($mp->authenticate()) {

            // Step 1: Fetch Contact + Household

            $user = $mp->table('dp_Users')
                ->select('Contact_ID') // fetch only specific fields
                ->filter("User_Name = '$name'")   // filter by email address (where $name holds the email)
                // ->filter("User_Name = 'mikeg@calvaryftl.org'")   // filter by email address (where $name holds the email)
                ->get();

            $Contact_ID = $user[0]['Contact_ID'];

            $contact = $mp->table('Contacts')
                // ->select('Contact_ID, Household_ID') // fetch only specific fields
                ->select('*') // fetch only specific fields
                ->filter("Contact_ID = '$Contact_ID'")   // filter by email address (where $name holds the email)
                ->get();

            $householdID = $contact[0]['Household_ID'];


            $debugContact = '<pre>' . print_r($contact, true) . '</pre>';
            $debugUser = '<pre>' . print_r($user, true) . '</pre>';

            if (empty($contact)) {
                return '<p>Contact not found for name: ' . esc_html($name) . '</p>';
            }

            $family_data = $mp->table('Participant_Milestones')
                ->select('
                Participant_ID_Table_Contact_ID_Table.First_Name,
                Participant_ID_Table_Contact_ID_Table.Last_Name,
                Participant_Milestones.Date_Accomplished
            ')
                ->filter("
                Participant_ID_Table_Contact_ID_Table.Household_ID = $householdID AND
                Participant_Milestones.Milestone_ID = 214 AND
                Participant_Milestones.At_Prior_Church = 0
            ")
                ->orderBy('Participant_Milestones.Date_Accomplished DESC')
                ->get();

            if (!empty($family_data) && is_array($family_data)) {
                foreach ($family_data as $person) {
                    $firstName = $person['First_Name'] ?? '';
                    $lastName = $person['Last_Name'] ?? '';
                    $fullName = urlencode(trim($firstName . ' ' . $lastName));

                    $date = new \DateTime($person['Date_Accomplished']);
                    $year = $date->format('Y');
                    $month = $date->format('F');
                    $day = $date->format('d');
                    $displayDay = (int) $date->format('j'); // Day without leading zero
                    $suffix = 'th';

                    // ---------------Spanish Formatting---------------
                    // Set the locale to Spanish
                    setlocale(LC_TIME, 'es_ES.UTF-8'); // For Spanish formatting
                    $spanishMonth = ucfirst(strftime('%B', $date->getTimestamp())); // e.g., 'Mayo'
                    $spanishDate = $date->format('d') . ' de ' . $spanishMonth . ' de ' . $date->format('Y');

                    // ---------------

                    if (!in_array(($displayDay % 100), [11, 12, 13])) {
                        switch ($displayDay % 10) {
                            case 1:
                                $suffix = 'st';
                                break;
                            case 2:
                                $suffix = 'nd';
                                break;
                            case 3:
                                $suffix = 'rd';
                                break;
                        }
                    }


                    $iframe = '<iframe 
                    src="https://calvary2024stg.wpenginepowered.com/certificate/en.php?name=' . $fullName . '&year=' . $year . '&month=' . $month . '&date=' . $displayDay . $suffix . '" 
                    frameborder="0" 
                    class="baptism-iframe"
                    >
                </iframe>';

                    //             $printButtons = '<div style="text-align:center; margin-bottom: 36px;">

                    //         <a 
                    //         style="display:inline-block;background-color:#4ab6f5;color:white;padding:20px 20px;border-radius:40px;font-size:20px;font-family:\'Poppins\', sans-serif;text-decoration:none;margin-right:10px;"
                    //         target="_blank" class="btn"  href="' . site_url('/certificate/en.php') . '?name=' . $fullName . '&date=' . urlencode($spanishDate) . '">Print Baptism Certificate</a>
                    //    </div>
                    //         <a 
                    //         style="display:inline-block;background-color:#4ab6f5;color:white;padding:20px 20px;border-radius:40px;font-size:20px;font-family:\'Poppins\', sans-serif;text-decoration:none;margin-right:10px;"
                    //         target="_blank" class="btn"  href="' . site_url('/certificate/es.php') . '?name=' . $fullName . '&date=' . urlencode($spanishDate) . '">Imprimir Certificado de Bautismo</a>
                    //    </div>';
                    $printButtons = '
<div class="baptism-buttons-container">
    <a 
        
        target="_blank" class="btn"  
        href="' . site_url('/certificate/en.php') . '?name=' . $fullName . '&date=' . urlencode($spanishDate) . '">
        Print Baptism Certificate
    </a>

    <a 
        
        target="_blank" class="btn"  
        href="' . site_url('/certificate/es.php') . '?name=' . $fullName . '&date=' . urlencode($spanishDate) . '">
        Imprimir Certificado de Bautismo
    </a>
</div>';
                    // <div style="width:60%;text-align:center; margin-bottom:36px; display:flex; justify-content:center; gap:10px;">
//     <a 
//         style="display:inline-block;background-color:#4ab6f5;color:white;padding:20px 20px;border-radius:40px;font-size:20px;font-family:\'Poppins\', sans-serif;text-decoration:none;"
//         target="_blank" class="btn"  
//         href="' . site_url('/certificate/en.php') . '?name=' . $fullName . '&date=' . urlencode($spanishDate) . '">
//         Print Baptism Certificate
//     </a>

                    //     <a 
//         style="display:inline-block;background-color:#4ab6f5;color:white;padding:20px 20px;border-radius:40px;font-size:20px;font-family:\'Poppins\', sans-serif;text-decoration:none;"
//         target="_blank" class="btn"  
//         href="' . site_url('/certificate/es.php') . '?name=' . $fullName . '&date=' . urlencode($spanishDate) . '">
//         Imprimir Certificado de Bautismo
//     </a>
// </div>';

                    // $output .= $iframe;
                    $output .= $iframe . $printButtons;
                }
            } else {
                $output = '<p>No baptism certificate available.</p>';
            }
        } else {
            $output = '<p>Unable to authenticate with Ministry Platform.</p>';
        }

        return $output;
        // return $output;
    }



    public static function mpapi_token_name_sc()
    {
        ob_start();
        ?>
        <div id="certificate-output">
            <p>Loading certificates...</p>
        </div>

        <script>
            function parseJwt(token) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = decodeURIComponent(atob(base64Url).split('').map(c =>
                        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    ).join(''));
                    return JSON.parse(base64);
                } catch (e) {
                    return null;
                }
            }

            document.addEventListener("DOMContentLoaded", function () {
                const token = localStorage.getItem("mpp-widgets_AuthToken");
                const name = parseJwt(token)?.name || '';
                const container = document.getElementById("certificate-output");

                if (!name) {
                    container.innerHTML = "<p>Name not found in token.</p>";
                    return;
                }

                fetch("<?php echo admin_url('admin-ajax.php'); ?>", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: "action=get_certificates_by_token_name&name=" + encodeURIComponent(name)
                })
                    .then(res => res.json())
                    .then(data => {
                        // console.log("AJAX response:", JSON.stringify(data, null, 2)); // ✅ log full response

                        if (data.success && data.data?.html) {
                            container.innerHTML = data.data.html;
                        } else {
                            const errorMsg = typeof data.data === 'string'
                                ? data.data
                                : JSON.stringify(data.data, null, 2); // ✅ display actual error object
                            container.innerHTML = `<p>Error: ${errorMsg}</p>`;
                        }
                    })
                    .catch((e) => {
                        console.error("AJAX error:", e);
                        container.innerHTML = "<p>AJAX request failed.</p>";
                    });
            });
        </script>
        <?php
        return ob_get_clean();
    }


    public static function mpapi_login_sc()
    {
        ob_start();

        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['mp_auth'])) {
            $email = sanitize_email($_POST['email']);
            $password = sanitize_text_field($_POST['password']);

            // echo "<script>console.log('MP Login - Email: " . esc_js($email) . "');</script>";
            // echo "<script>console.log('MP Login - Password: " . esc_js($password) . "');</script>";

            $mp = new MP();

            if ($mp->authenticate()) {
                // echo "<script>console.log('MP Authenticated with API');</script>";

                $user = $mp->table('dp_Users')
                    ->select("Contact_ID, User_Name, Password") // fetch only specific fields
                    ->filter("User_Name = '$email'")
                    ->get();
                // echo "<script>console.log('User data:', " . json_encode($user) . ");</script>";
                $Contact_ID = $user[0]['Contact_ID'];
                $User_Name = $user[0]['User_Name'];
                // echo "<script>console.log('Contact_ID:', '$Contact_ID');</script>";
                // echo "<script>console.log('User_Name:', '$User_Name');</script>";


                if (!empty($user)) {
                    // echo "<script>console.log('User found in dp_Users');</script>";
                    $hashedPassword = $user[0]['Password'];
                    $md5Hash = base64_encode(md5($password, true));
                    $sha1Hash = base64_encode(sha1($password, true));

                    // echo "<script>console.log('hashedPassword:', '$hashedPassword');</script>";
                    // echo "<script>console.log('MD5 Base64:', '$md5Hash');</script>";
                    // echo "<script>console.log('SHA1 Base64:', '$sha1Hash');</script>";

                    if ($md5Hash === $hashedPassword) {
                        // echo "<script>console.log('Password matched');</script>";

                        $contactId = $user[0]['Contact_ID'];

                        $contact = $mp->table('Contacts')
                            ->select('*')
                            ->filter("Contact_ID = '$contactId'")
                            ->get();

                        $contactJson = json_encode($contact[0]);
                        // echo "<script>console.log('Contact:', " . json_encode($contact) . ");</script>";
                        // echo "<script>console.log('Contact:', " . json_encode($contactJson) . ");</script>";

                        echo "<p>Login successful. Check console for user details.</p>";
                    } else {
                        // echo "<script>console.log('Password mismatch');</script>";
                        echo "<p>Invalid password.</p>";
                    }
                } else {
                    // echo "<script>console.log('No user found in dp_Users');</script>";
                    echo "<p>No user found with the provided email.</p>";
                }
            } else {
                // echo "<script>console.log('MP authentication failed');</script>";
                echo "<p>Authentication to Ministry Platform failed.</p>";
            }
        }
        ?>
        <form method="POST" action="">
            <label>Email: <input type="email" name="email" required></label><br>
            <label>Password: <input type="password" name="password" required></label><br>
            <input type="hidden" name="mp_auth" value="1" />
            <button type="submit">Login</button>
        </form>
        <?php

        return ob_get_clean();
    }

    // public static function mpapi_search_groups_ajax()
    // {
    //     // Get the user input from AJAX POST
    //     $searchTerm = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
    //     echo "<script>console.log('MP Login - Email: " . esc_js($searchTerm) . "');</script>";

    //     if (empty($searchTerm)) {
    //         echo 'Please enter a search term.';
    //         wp_die();
    //     }

    //     $mp = new MP();

    //     if ($mp->authenticate()) {
    //         $escapedSearch = addslashes($searchTerm);
    //         $filter = "Groups.Group_Name LIKE '%{$escapedSearch}%'";

    //         try {
    //             $groups = $mp->table('Groups')
    //                 ->select("Group_ID, Group_Name")
    //                 ->filter($filter)
    //                 ->orderBy('Group_Name')
    //                 ->get();
    //         } catch (Exception $e) {
    //             echo 'Error fetching groups: ' . esc_html($e->getMessage());
    //             wp_die();
    //         }

    //         if (!empty($groups)) {
    //             echo '<h3>Search Results:</h3><ul>';
    //             foreach ($groups as $group) {
    //                 echo '<li>' . esc_html($group['Group_Name']) . '</li>';
    //             }
    //             echo '</ul>';
    //         } else {
    //             echo '<p>No groups found for your search.</p>';
    //         }
    //     } else {
    //         echo '<p>Ministry Platform authentication failed.</p>';
    //     }

    //     wp_die(); // ✅ Always end AJAX calls properly
    // }

    public static function mpapi_search_groups_ajax()
    {
        $searchTerm = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
        $page = isset($_POST['page']) ? intval($_POST['page']) : 1;
        $limit = 10;
        $offset = ($page - 1) * $limit;

        if (empty($searchTerm)) {
            echo json_encode(['html' => '<p>Please enter a search term.</p>', 'hasMore' => false]);
            wp_die();
        }
        $futureDate = getdate();

        $mp = new MP();

        if ($mp->authenticate()) {
            $escapedSearch = addslashes($searchTerm);
            $filter = "Groups.Group_Type_ID = 1 AND (Groups.End_Date is null or Groups.End_Date > GETDATE()) AND Groups.Available_Online = 1 AND Groups.Group_Name LIKE '%{$escapedSearch}%'";
            // $filter = "Groups.Group_Name LIKE '%{$escapedSearch}%'";

            try {
                // Get total matching groups
                $allGroups = $mp->table('Groups')
                    ->select("Group_ID, Group_Name")
                    ->filter($filter)
                    ->orderBy('Group_Name')
                    ->get();

                $totalResults = count($allGroups);

                // Get paginated groups
                $groups = array_slice($allGroups, $offset, $limit);

                if (!empty($groups)) {
                    $html = '';
                    foreach ($groups as $group) {
                        $html .= '<li>' . esc_html($group['Group_Name']) . '</li>';
                    }
                    $html = '<ul>' . $html . '</ul>';

                    // Check if more results exist
                    $hasMore = ($offset + $limit) < $totalResults;

                    echo json_encode(['html' => $html, 'hasMore' => $hasMore, 'totalResults' => $allGroups, 'currentPage' => $page]);
                } else {
                    echo json_encode(['html' => '<p>No groups found for your search.</p>', 'hasMore' => false]);
                }
            } catch (Exception $e) {
                echo json_encode(['html' => '<p>Error fetching groups: ' . esc_html($e->getMessage()) . '</p>', 'hasMore' => false]);
            }
        } else {
            echo json_encode(['html' => '<p>Ministry Platform authentication failed.</p>', 'hasMore' => false]);
        }

        wp_die();
    }

    public static function mpapi_get_campuses()
    {
        $mp = new MP();

        if ($mp->authenticate()) {
            try {
                // ✅ Select all columns
                $campuses = $mp->table('Congregations')
                    ->select('Congregation_ID, Congregation_Name')
                    ->filter('Available_Online = 1')
                    ->orderBy('Congregation_Name')
                    ->get();


                echo json_encode($campuses);
            } catch (Exception $e) {
                echo json_encode([]);
            }
        } else {
            echo json_encode([]);
        }

        wp_die(); // End the AJAX request
    }


    public static function mpapi_search_events_ajax()
    {
        $searchTerm = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
        $campusIdsRaw = isset($_POST['campusIds']) ? sanitize_text_field($_POST['campusIds']) : '';
        $campusIds = array_filter(array_map('intval', explode(',', $campusIdsRaw)));

        $offset = isset($_POST['offset']) ? intval($_POST['offset']) : 0;
        $limit = isset($_POST['limit']) ? intval($_POST['limit']) : 4;

        $ministryId = isset($_POST['ministryId']) ? intval($_POST['ministryId']) : 2;

        $mp = new MP();

        if ($mp->authenticate()) {
            $conditions = [];

            if (!empty($searchTerm)) {
                $escapedSearch = addslashes($searchTerm);
                $conditions[] = "Events.Event_Title LIKE '%{$escapedSearch}%'";
            }

            if (!empty($campusIds)) {
                $campusIdList = implode(',', $campusIds);
                $conditions[] = "Events.Congregation_ID IN ({$campusIdList})";
            }

            $conditions[] = "Program_ID_Table.Ministry_ID = {$ministryId}";
            $conditions[] = "Events.Event_Start_Date > getdate()";
            $conditions[] = "Visibility_Level_ID_Table.Visibility_Level_ID = 4";

            $filter = !empty($conditions) ? implode(' AND ', $conditions) : '1=1';

            try {
                $allEvents = $mp->table('Events')
                    ->select('
                    Event_ID,
                    Event_Title,
                    Event_End_Date,
                    Meeting_Instructions,    
                    Event_Start_Date,
                    Congregation_ID_Table.Congregation_ID,
                    Congregation_ID_Table.Congregation_Name,
                    Program_ID_Table.Program_ID,
                    Program_ID_Table.Program_Name,
                    Program_ID_Table.Ministry_ID,
                    Visibility_Level_ID_Table.Visibility_Level_ID
                ')
                    ->filter($filter)
                    ->orderBy('Event_Start_Date')
                    ->get();

                $totalResults = count($allEvents);

                // Manual pagination using array_slice
                $paginatedEvents = array_slice($allEvents, $offset, $limit);

                $hasMore = ($offset + $limit) < $totalResults;

                echo json_encode([
                    'events' => $paginatedEvents,
                    'hasMore' => $hasMore,
                    'totalResults' => $totalResults,
                    'offset' => $offset,
                    'limit' => $limit
                ]);
            } catch (Exception $e) {
                echo json_encode(['html' => '<p>Error fetching events: ' . esc_html($e->getMessage()) . '</p>']);
            }
        } else {
            echo json_encode(['html' => '<p>Ministry Platform authentication failed.</p>']);
        }

        wp_die();
    }

    public static function hashTagEventsCheck($atts = [], $content = null)
    {
        $atts = shortcode_atts([
            'hashtag' => ''
        ], $atts);



        $hashtag = sanitize_text_field($atts['hashtag']);
        error_log('Hashtag searched: ' . $hashtag);
        if (empty($hashtag)) {
            return '<p>No hashtag provided.</p>';
        }

        $mp = new MP();

        if ($mp->authenticate()) {
            try {
                $events = $mp->table('Events')
                    ->select('
                    Event_ID,
                    Event_Title,
                    Event_End_Date,
                    Meeting_Instructions,    
                    Event_Start_Date,
                    Congregation_ID_Table.Congregation_ID,
                    Congregation_ID_Table.Congregation_Name,
                    Program_ID_Table.Program_ID,
                    Program_ID_Table.Program_Name,
                    Program_ID_Table.Ministry_ID,
                    Visibility_Level_ID_Table.Visibility_Level_ID
                ')

                    ->filter("(Events.Event_Start_Date between getdate() and dateadd(day, 60, getdate())) AND Visibility_Level_ID_Table.[Visibility_Level_ID] = 4 AND Events.[_Approved] = 1 AND Hashtag = '{$hashtag}')")
                    // ->filter("(Events.Event_Start_Date between getdate() and dateadd(day, 60, getdate())) AND Visibility_Level_ID_Table.[Visibility_Level_ID] = 4 AND Events.[_Approved] = 1 AND Hashtag LIKE '%{$hashtag}%'")                    
                    ->orderBy('Event_Start_Date')
                    ->get();

                if (empty($events)) {
                    // return '<p>Nothing hashtag events found.</p>';
                    return '<p>Nothing hashtag events found: ' . esc_html($hashtag) . " " . esc_html($hashtag) . '</p>';
                }

                $output = '<ul class="mp-hashtag-events">';
                foreach ($events as $event) {
                    $title = esc_html($event['Event_Title'] ?? '');
                    $Location = esc_html($event['Congregation_ID_Table.Congregation_Name'] ?? '');
                    $Hashtag = esc_html($event['Hashtag'] ?? '');
                    $date = esc_html($event['Event_Start_Date'] ?? '');
                    $output .= "<li><strong>{$title}</strong> - <strong>{$Location}</strong> - {$Hashtag} - {$date}</li>";
                }
                $output .= '</ul>';

                return $output;
            } catch (Exception $e) {
                return '<p>Error fetching events.</p>';
            }
        } else {
            return '<p>Unable to authenticate with Ministry Platform.</p>';
        }
    }



    // public static function hashTagEvents($atts = [], $content = null)
    // {
    //     $atts = shortcode_atts([
    //         'hashtag' => ''
    //     ], $atts);



    //     $hashtag = sanitize_text_field($atts['hashtag']);
    //     error_log('Hashtag searched: ' . $hashtag);
    //     if (empty($hashtag)) {
    //         return '<p>No hashtag provided.</p>';
    //     }

    //     $mp = new MP();

    //     if ($mp->authenticate()) {
    //         try {
    //             $events = $mp->table('Events')
    //                 ->select("*,
    //                 Congregation_ID_Table.Congregation_ID,
    //                 Congregation_ID_Table.Congregation_Name")
    //                 // ->filter("(Visibility_Level_ID_Table.[Visibility_Level_ID] = 4 AND Events.[_Approved] = 1 AND Hashtag = '{$hashtag}')")
    //                 ->filter("(Events.Event_Start_Date >= '2025-09-12' AND Visibility_Level_ID_Table.[Visibility_Level_ID] = 4 AND Events.Cancelled = 0 AND Events.[_Approved] = 1 AND  Hashtag = '{$hashtag}')")
    //                 ->orderBy('Event_Start_Date desc')
    //                 ->get();

    //             if (empty($events)) {
    //                 // return '<p>Nothing hashtag events found.</p>';
    //                 return '<p>Nothing hashtag events found ffff: ' . esc_html($hashtag) . " " . $atts['hashtag'] . '</p>';
    //             }

    //             echo "<script>console.log('Event:', " . json_encode($events) . ");</script>";

    //             $output = '<div class="mp-hashtag-events-grid">';
    //             foreach ($events as $event) {
    //                 $startRaw = $event['Event_Start_Date'] ?? '';
    //                 $endRaw = $event['Event_End_Date'] ?? '';
    //                 $start = $startRaw ? date('D, M j, Y g:i A', strtotime($startRaw)) : '';
    //                 $end = $endRaw ? date('g:i A', strtotime($endRaw)) : '';
    //                 $dateDisplay = $start && $end ? "{$start} - {$end}" : $start;

    //                 $eventId = $event['Event_ID'] ?? '';

    //                 $baseUrl = get_site_url();
    //                 $url = "{$baseUrl}/events?id={$eventId}";

    //                 $title = esc_html($event['Event_Title'] ?? '');
    //                 $hashtag = esc_html($event['Hashtag'] ?? '');
    //                 $location = esc_html($event['Congregation_Name'] ?? '');
    //                 $MeetInstruction = esc_html($event['Meeting_Instructions'] ?? '');
    //                 $desc = esc_html($event['Description'] ?? '');
    //                 $output .= "
    //                 <a href='{$url}' class='mp-event-card-link' style='text-decoration:none;color:inherit;'>
    //     <div class='mp-event-card'>
    //         <h3>{$title}ccc</h3>

    //         <p><strong>Date:</strong> {$dateDisplay}</p>
    //         <p><strong>Location:</strong> {$location}</p>

    //         <p class='mp-event-desc' title='{$desc}'><strong>Description:</strong> {$desc}</p>
    //     </div>
    //     </a>
    // ";
    //             }
    //             $output .= '</div>';

    //             return $output;
    //         } catch (Exception $e) {
    //             return '<p>Error fetching events.</p>';
    //         }
    //     } else {
    //         return '<p>Unable to authenticate with Ministry Platform.</p>';
    //     }
    // }



    // --------------------

    public static function hashTagEvents($atts = [], $content = null)
    {
        $atts = shortcode_atts([
            'hashtag' => ''
        ], $atts);

        $hashtag = sanitize_text_field($atts['hashtag']);
        error_log('Hashtag searched: ' . $hashtag);
        if (empty($hashtag)) {
            return '<p>No hashtag provided.</p>';
        }

        $mp = new MP();

        if ($mp->authenticate()) {
            try {
                $events = $mp->table('Events')
                    ->select("*, Congregation_ID_Table.Congregation_ID, Congregation_ID_Table.Congregation_Name")
                    ->filter("(Events.Event_Start_Date >= '2025-09-12' AND Visibility_Level_ID_Table.[Visibility_Level_ID] = 4 AND Events.Cancelled = 0 AND Events.[_Approved] = 1 AND Hashtag = '{$hashtag}')")
                    ->orderBy('Event_Start_Date desc')
                    ->get();

                if (empty($events)) {
                    return '<p>No hashtag events found: ' . esc_html($hashtag) . '</p>';
                }

                $output = '<style>

                .mp-hashtag-events-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}
.mp-event-card-basic {
  width: 400px;
  min-width: 0;
  display: flex;
  flex-direction: row;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  min-height: 120px;
  margin-bottom: 24px;
  overflow: hidden;
}
.mp-event-card-left {
  flex: 1 1 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.mp-event-title {
  margin: 0 0 0px 0;
  color: #565656;
  font-size: 1.6em;
  font-weight: 700;
  height: 60px;
  padding: 0;
}
.mp-event-location {
  margin: 4px 0;
  font-size: 1.3em;
  font-weight: 600;
  color: #fff;
  background: #4ab6f5;
  border-radius: 20px;
  display: inline-block;
  padding: 10px 20px;
}
.mp-event-date {
  margin: 4px 0;
  font-size: 1em;
  padding: 0px;
}
.mp-event-desc {
  margin: 8px 0 0 0;
  color: #444;
}
.mp-event-card-right {
  position: relative;
  width: 80px;
  background: #fff;
  min-width: 80px;
  
}
.mp-event-date-circle,
.mp-event-arrow-circle {
  position: absolute;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff;
  color: #4ab6f5; /* light blue text */
  border: 2px solid #4ab6f5; /* light blue border */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.mp-event-date-circle {
position: absolute;
  top: 12px;
  right: 12px;
  flex-direction: column;
  font-weight: 600;
  font-size: 1em;
  background: #4ab6f5;
  color: white;
}
.mp-event-arrow-circle {
position: absolute;
  bottom: 12px;
  right: 12px;
}
.mp-event-month {
  font-size: 1em;
  line-height: 1.1em;
}
.mp-event-day {
  font-size: 1.3em;
  line-height: 1.1em;
  font-weight: bold;
}
.mp-event-arrow-circle svg {
  width: 40px;
  height: 40px;
  display: block;
   fill: #4ab6f5;
}
@media (max-width: 900px) {
  .mp-event-card-basic {
    width: 90vw;
  }
}
@media (max-width: 700px) {
  .mp-event-card-basic {
    flex-direction: row;
    flex-wrap: wrap;
    width: 98vw;
    align-items: flex-start;
  }
  .mp-event-card-left {
    max-width: calc(100vw - 100px);
    flex: 1 1 0;
  }
 .mp-event-card-right {
    width: 80px;
    min-width: 80px;
    padding: 12px 0;
    position: relative;
    height: 100%;  
    min-height: 0;  
}
}

</style>';

                $output .= '<div class="mp-hashtag-events-grid">';
                foreach ($events as $event) {
                    $startRaw = $event['Event_Start_Date'] ?? '';
                    $endRaw = $event['Event_End_Date'] ?? '';
                    $start = $startRaw ? date('D, M j, Y g:i A', strtotime($startRaw)) : '';
                    $end = $endRaw ? date('g:i A', strtotime($endRaw)) : '';
                    $dateDisplay = $start && $end ? "{$start} - {$end}" : $start;

                    $eventId = $event['Event_ID'] ?? '';
                    $baseUrl = get_site_url();
                    $url = "{$baseUrl}/events?id={$eventId}";

                    $title = esc_html($event['Event_Title'] ?? '');
                    $location = esc_html($event['Congregation_Name'] ?? $event['Congregation_ID_Table.Congregation_Name'] ?? '');
                    $desc = esc_html($event['Description'] ?? '');
                    $descShort = strlen($desc) > 200 ? mb_substr($desc, 0, 200) . '...' : $desc;

                    $startDateObj = $startRaw ? new \DateTime($startRaw) : null;
                    $endDateObj = $endRaw ? new \DateTime($endRaw) : null;
                    $startMonth = $startDateObj ? strtoupper($startDateObj->format('M')) : '';
                    $startDay = $startDateObj ? $startDateObj->format('j') : '';

                    $dateDisplay = '';
                    $timeDisplay = '';

                    if ($startDateObj && $endDateObj) {
                        // $dateDisplay = $startDateObj->format('D, M j, Y') . ' - ' . $endDateObj->format('D, M j');
                        // $timeDisplay = $startDateObj->format('g:i A') . ' - ' . $endDateObj->format('g:i A');

                        // Check if start and end dates are on the same day
                        if ($startDateObj->format('Y-m-d') === $endDateObj->format('Y-m-d')) {
                            $dateDisplay = $startDateObj->format('D, M j');
                            $timeDisplay = $startDateObj->format('g:i A') . ' - ' . $endDateObj->format('g:i A');
                        } else {
                            $dateDisplay = $startDateObj->format('D, M j, Y') . ' - ' . $endDateObj->format('D, M j');
                            $timeDisplay = $startDateObj->format('g:i A') . ' - ' . $endDateObj->format('g:i A');
                        }
                    } elseif ($startDateObj) {
                        $dateDisplay = $startDateObj->format('D, M j, Y');
                        $timeDisplay = $startDateObj->format('g:i A');
                    }
                    // <p class='mp-event-date'> {$timeDisplay}</p>
                    $output .= "
<div class='mp-event-card-basic'>
  <div class='mp-event-card-left'>
    <h3 class='mp-event-title'>{$title}</h3>
    <p class='mp-event-location'> {$location}</p>
    <p class='mp-event-date'> {$dateDisplay} | {$timeDisplay}</p>    
    <p class='mp-event-desc' title='{$desc}'> {$descShort}</p>
  </div>
  <div class='mp-event-card-right'>
    <div class='mp-event-date-circle'>
      <span class='mp-event-month'>{$startMonth}</span>
      <span class='mp-event-day'>{$startDay}</span>
    </div>
    <a href='{$url}' class='mp-event-arrow-circle' title='View Event'>
    

      <svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
  
  <path d='M13 20H27M27 20L22.5 15.5M27 20L22.5 24.5' stroke='#4ab6f5' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/>
</svg>
    </a>
  </div>
</div>
";
                }
                $output .= '</div>';

                return $output;
            } catch (Exception $e) {
                return '<p>Error fetching events.</p>';
            }
        } else {
            return '<p>Unable to authenticate with Ministry Platform.</p>';
        }
    }

}


