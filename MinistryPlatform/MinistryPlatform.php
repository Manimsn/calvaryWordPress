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
add_shortcode('campusFilterEvents', ['MinistryPlatform\MP_API_SHORTCODES', 'campusFilterEvents']); // Not used directly
add_shortcode('newHashTagEvents', ['MinistryPlatform\MP_API_SHORTCODES', 'newHashTagEvents']); // Not used directly


add_shortcode('newSwiperEvents', ['MinistryPlatform\MP_API_SHORTCODES', 'newSwiperEvents']);

add_shortcode('mpapi_list_groups', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_list_groups_sc']);

add_action('wp_ajax_mpapi_search_groups_finder_ajax', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_search_groups_finder_ajax']);
add_action('wp_ajax_nopriv_mpapi_search_groups_finder_ajax', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_search_groups_finder_ajax']);

add_action('wp_ajax_mpapi_get_congregations', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_get_congregations']);
add_action('wp_ajax_nopriv_mpapi_get_congregations', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_get_congregations']);


add_action('wp_ajax_mpapi_get_life_stages', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_get_life_stages']);
add_action('wp_ajax_nopriv_mpapi_get_life_stages', ['MinistryPlatform\MP_API_SHORTCODES', 'mpapi_get_life_stages']);

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
        href="' . site_url('/certificate/en.php') . '?name=' . $fullName . '&year=' . $year . '&month=' . $month . '&date=' . $displayDay . $suffix . '" >
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

            $mp = new MP();

            if ($mp->authenticate()) {

                $user = $mp->table('dp_Users')
                    ->select("Contact_ID, User_Name, Password") // fetch only specific fields
                    ->filter("User_Name = '$email'")
                    ->get();

                $Contact_ID = $user[0]['Contact_ID'];
                $User_Name = $user[0]['User_Name'];

                if (!empty($user)) {
                    $hashedPassword = $user[0]['Password'];
                    $md5Hash = base64_encode(md5($password, true));
                    $sha1Hash = base64_encode(sha1($password, true));

                    if ($md5Hash === $hashedPassword) {

                        $contactId = $user[0]['Contact_ID'];

                        $contact = $mp->table('Contacts')
                            ->select('*')
                            ->filter("Contact_ID = '$contactId'")
                            ->get();

                        $contactJson = json_encode($contact[0]);

                        echo "<p>Login successful. Check console for user details.</p>";
                    } else {
                        echo "<p>Invalid password.</p>";
                    }
                } else {
                    echo "<p>No user found with the provided email.</p>";
                }
            } else {
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
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: #4ab6f5;
  border-radius: 25px;
  display: inline-block;
  padding: 10px 20px;
}
.mp-event-date {
  margin: 4px 0;
  font-size: 1em;
  padding: 0px;
  color: #444;
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
                    $descShort = strlen($desc) > 100 ? mb_substr($desc, 0, 100) . '...' : $desc;

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
    public static function campusFilterEvents($atts = [], $content = null)
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
                    ->filter("(Events.Event_Start_Date >= getDate() AND Visibility_Level_ID_Table.[Visibility_Level_ID] = 4 AND Events.Cancelled = 0 AND Events.[_Approved] = 1 AND Congregation_ID_Table.Congregation_ID = '{$hashtag}')")
                    ->orderBy('Event_Start_Date')
                    ->get();

                if (empty($events)) {
                    return '<p>No hashtag events found: ' . esc_html($hashtag) . '</p>';
                }



                $output = '<style>

                .mp-hashtag-events-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
    justify-content: flex-start;
  max-width: 1760px;
  margin: 0 auto;
}

/* Responsive adjustments for different screen sizes */
@media (min-width: 1400px) {
  .mp-hashtag-events-grid {
    justify-content: flex-start;
  }
}

@media (max-width: 1399px) {
  .mp-hashtag-events-grid {
    justify-content: center;
    max-width: 100%;
  }
}

@media (max-width: 900px) {
  .mp-hashtag-events-grid {
    justify-content: center;
    padding: 0 10px;
  }
  .mp-event-card-basic {
    width: 90vw;
  }
}

@media (max-width: 700px) {
  .mp-hashtag-events-grid {
    justify-content: center;
  }
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
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: #4ab6f5;
  border-radius: 25px;
  display: inline-block;
  padding: 10px 20px;
}
.mp-event-date {
  margin: 4px 0;
  font-size: 1em;
  padding: 0px;
  color: #444;
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
                    $descShort = strlen($desc) > 100 ? mb_substr($desc, 0, 100) . '...' : $desc;

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

    public static function newHashTagEvents($atts = [], $content = null)
    {
        $atts = shortcode_atts([
            'hashtag' => '',
            'filter_by' => 'hashtag' // Default to 'hashtag', can also be 'congregation_id'
        ], $atts);

        $hashtag = sanitize_text_field($atts['hashtag']);
        $filter_by = sanitize_text_field($atts['filter_by']);

        error_log('Hashtag searched: ' . $hashtag);
        error_log('Filter by: ' . $filter_by);

        if (empty($hashtag)) {
            return '<p>No hashtag provided.</p>';
        }

        $mp = new MP();

        if ($mp->authenticate()) {
            try {
                // Build the filter condition based on filter_by parameter
                $filter_condition = '';
                if ($filter_by === 'congregation_id') {
                    $filter_condition = "Congregation_ID_Table.Is_Campus = 1 AND Congregation_ID_Table.Congregation_ID = '{$hashtag}'";
                } else {
                    // Default to hashtag filtering
                    $filter_condition = "Hashtag = '{$hashtag}'";
                }

                $events = $mp->table('Events')
                    ->select("*, Congregation_ID_Table.Congregation_ID, Congregation_ID_Table.Congregation_Name")
                    ->filter("(Events.Event_Start_Date >= getDate() AND Visibility_Level_ID_Table.[Visibility_Level_ID] = 4 AND Events.Cancelled = 0 AND Events.[_Approved] = 1 AND {$filter_condition})")
                    ->orderBy('Event_Start_Date')
                    ->get();

                if (empty($events)) {
                    return '<p>No hashtag events found: ' . esc_html($hashtag) . '</p>';
                }

                $output = '<style>
     
        .container {
            max-width: 1400px;
            width: 100%;
            margin: 0 auto;
            padding: 20px;            
            font-family: Poppins, sans-serif;
        }

        .card-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            justify-content: center;
            align-content: start;
        }

        .card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 0;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            min-height: 250px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
        }

        /* Card Top Section */
        .card-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 15px 5px 15px;
            min-height: 60px;
            height: 80px;
        }

        /* Left side of top section - just for date */
        .card-left {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            flex-shrink: 0;
            height: 100%;
            justify-content: center;
        }

        /* Date Circle */
        .date-circle {
            background: #4ab6f5;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;            
            font-family: Poppins, sans-serif;
            font-weight: bold;
            font-size: 0.8rem;
            text-align: center;
        }

        .date-month {
            font-size: 0.65rem;
            line-height: 1;
        }

        .date-day {
            font-size: 0.9rem;
            line-height: 1;
        }

        /* Right side of top section - takes more space */
        .card-right {
            flex: 1;
            margin-left: 15px;
            height: 100%;
            display: flex;
            align-items: center;
        }

        /* Location Pill - now separate section */
        .card-location {
            padding: 10px 15px 10px 15px;
        }

        .location-pill {
            background: #4ab6f5;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;            
            font-family: Poppins, sans-serif;
            font-size: 0.8rem;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .location-icon {
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            position: relative;
        }

        .location-icon::before {
            
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 8px;
        }

        .card-title {
            font-family: Poppins, sans-serif;
            font-size: 1.6em;
            font-weight: bold;
            color: #333;
            line-height: 1.3;
            position: relative;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .card-title:hover::after {
            content: attr(data-full-title);
            position: absolute;
            top: 100%;
            left: 0;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.9rem;
            white-space: normal;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            max-width: 200px;
            word-wrap: break-word;
        }

        /* Card Bottom Section */
        .card-bottom {
            padding: 10px 15px;
            border-top: 1px solid white;
            background: white;
        }

        /* Date and Time section */
        .card-datetime {
            font-family: Poppins, sans-serif;
            color: #333;
            font-size: 0.85rem;
            font-weight: 500;
            margin-bottom: 10px;
        }

        /* Bottom content section with left and right */
        .card-bottom-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }

        .card-description {
            flex: 1;
            font-family: Poppins, sans-serif;
            color: #333;
            line-height: 1.4;
            font-size: 0.9rem;
        }

        .card-description.truncated {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        /* Arrow button */
        .card-arrow {
            width: 50px;
            height: 50px;
            border: 2px solid #333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
            text-decoration: none;
        }

        .card-arrow:hover {
            background: #333;
            color: white;
        }

        .card-arrow svg path {
            stroke: #333;
            transition: stroke 0.3s ease;
        }

        .card-arrow:hover svg path {
            stroke: white;
        }

        /* Large tablets and smaller - 2 cards per row */
        @media (max-width: 1024px) {
            .card-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }
        }

        /* Small tablets - 2 cards per row */
        @media (max-width: 768px) {
            .card-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }
        }

        /* Mobile styles - 1 card per row */
        @media (max-width: 480px) {
            .card-grid {
                grid-template-columns: 1fr;
                gap: 10px;
            }
            
            .card-top {
                padding: 12px 12px 5px 12px;
            }
            
            .card-location {
                padding: 0 12px 8px 12px;
            }
            
            .card-bottom {
                padding: 12px;
            }
        }

        /* Ensure grid stays left-aligned when not full */
        .card-grid {
            justify-items: stretch;
        }
</style>';

                $output .= '<div class="container"><div class="card-grid">';
                foreach ($events as $event) {
                    $startRaw = $event['Event_Start_Date'] ?? '';
                    $endRaw = $event['Event_End_Date'] ?? '';

                    $eventId = $event['Event_ID'] ?? '';
                    $baseUrl = get_site_url();
                    $url = "{$baseUrl}/events?id={$eventId}";

                    $title = esc_html($event['Event_Title'] ?? '');
                    $location = esc_html($event['Congregation_Name'] ?? $event['Congregation_ID_Table.Congregation_Name'] ?? '');
                    // $desc = esc_html($event['Description'] ?? '');
                    $desc = esc_html(wp_strip_all_tags($event['Web_Description'] ?? ''));

                    // Title will be truncated by CSS to 2 lines
                    $titleTruncated = $title;

                    // Truncate description to 100 characters
                    $descTruncated = strlen($desc) > 100 ? substr($desc, 0, 100) . '...' : $desc;

                    $startDateObj = $startRaw ? new \DateTime($startRaw) : null;
                    $endDateObj = $endRaw ? new \DateTime($endRaw) : null;
                    $startMonth = $startDateObj ? strtoupper($startDateObj->format('M')) : '';
                    $startDay = $startDateObj ? $startDateObj->format('j') : '';

                    $dateDisplay = '';
                    $timeDisplay = '';

                    if ($startDateObj && $endDateObj) {
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

                    $output .= "
<div class='card'>
    <div class='card-top'>
        <div class='card-left'>
            <div class='date-circle'>
                <div class='date-month'>{$startMonth}</div>
                <div class='date-day'>{$startDay}</div>
            </div>
        </div>
        <div class='card-right'>
            <div class='card-title' >
                {$titleTruncated}
            </div>
        </div>
    </div>
    <div class='card-location'>
        <div class='location-pill'>
            
            {$location}
        </div>
    </div>
    <div class='card-bottom'>
        <div class='card-datetime'>
            {$dateDisplay} | {$timeDisplay}
        </div>
        <div class='card-bottom-content'>
            <div class='card-description' data-full-description='{$desc}'>
                {$descTruncated}
            </div>
            <a href='{$url}' class='card-arrow' title='View Event'>
                <svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M13 20H27M27 20L22.5 15.5M27 20L22.5 24.5' stroke='#333' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' />
                </svg>
            </a>
        </div>
    </div>
</div>
";
                }
                $output .= '</div></div>';

                return $output;
            } catch (Exception $e) {
                return '<p>Error fetching events.</p>';
            }
        } else {
            return '<p>Unable to authenticate with Ministry Platform.</p>';
        }
    }

    public static function newSwiperEvents($atts)
    {
        $atts = shortcode_atts([
            'hashtag' => '',
            'filter_by' => 'hashtag' // Default to 'hashtag', can also be 'congregation_id'
        ], $atts);

        $hashtag = sanitize_text_field($atts['hashtag']);
        $filter_by = sanitize_text_field($atts['filter_by']);

        error_log('Swiper Hashtag searched: ' . $hashtag);
        error_log('Swiper Filter by: ' . $filter_by);



        if (empty($hashtag)) {
            return '<p>No hashtag provided.</p>';
        }

        $mp = new MP();

        if ($mp->authenticate()) {
            try {
                // Build the filter condition based on filter_by parameter
                $filter_condition = '';
                if ($filter_by === 'congregation_id') {
                    $filter_condition = "Congregation_ID_Table.Is_Campus = 1 AND Congregation_ID_Table.Congregation_ID = '{$hashtag}'";
                } else {
                    $filter_condition = "Hashtag = '{$hashtag}'";
                }

                $events = $mp->table('Events')
                    ->select("*, Congregation_ID_Table.Congregation_ID, Congregation_ID_Table.Congregation_Name, Congregation_ID_Table.Is_Campus")
                    ->filter("(Events.Event_Start_Date >= getDate() AND Visibility_Level_ID_Table.[Visibility_Level_ID] = 4 AND Events.Cancelled = 0 AND Events.[_Approved] = 1 AND {$filter_condition})")
                    ->orderBy('Event_Start_Date')
                    ->get();

                if (empty($events)) {
                    return '<p>No events found for this hashtag.</p>';
                }

                $output = '
                <style>
                @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

                .swiper-events-container {
                    width: 100%;
                    max-width: 100%;
                    margin: 0 auto;
                    padding: 20px 0px 20px 20px;
                    font-family: "Poppins", sans-serif;
                    position: relative;
                }

                .swiper-navigation {
                    position: absolute;
                    top: -40px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 10;
                }

                .swiper-button-prev,
                .swiper-button-next {
                    position: static !important;
                    width: 40px !important;
                    height: 40px !important;
                    margin: 0 !important;
                    background: white;
                    border: 2px solid #4ab6f5;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .swiper-button-prev:after,
                .swiper-button-next:after {
                    content: none !important;
                }

                .swiper-button-prev:hover,
                .swiper-button-next:hover {
                    background: #4ab6f5;
                    transform: scale(1.1);
                }

                .swiper-button-prev svg,
                .swiper-button-next svg {
                    width: 20px;
                    height: 20px;
                    transition: all 0.3s ease;
                }

                .swiper-button-prev:hover svg path,
                .swiper-button-next:hover svg path {
                    stroke: white;
                }

                .swiper-button-disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .swiper-button-disabled:hover {
                    background: white;
                    transform: none;
                }

                .swiper-button-disabled:hover svg path {
                    stroke: #4ab6f5;
                }

                .swiper {
                    width: 100%;                    
                    padding: 20px 0;
                }

                .swiper-slide {
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                    padding: 0;
                    overflow: hidden;
                    transition: box-shadow 0.3s ease;
                    height: auto;
                }

                .swiper-slide:hover {
                    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
                }

                .event-card {
                    background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 0;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            min-height: 250px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
                }

                .horiz-card-top {
                     display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 15px 5px 15px;
            min-height: 60px;
            height: 80px;
                }

                .horiz-card-left {
                    display: flex;
                    align-items: center;
                    height: 100%;
                    flex-shrink: 0;
                }

                .horiz-date-circle {
                    width: 50px;
                    height: 50px;
                    background: #4ab6f5;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: "Poppins", sans-serif;
                    font-weight: bold;
                    text-align: center;
                    margin-right: 15px;
                }

                .horiz-date-month {
                    font-size: 10px;
                    line-height: 1;
                    font-family: "Poppins", sans-serif;
                    font-weight: bold;
                }

                .horiz-date-day {
                    font-size: 14px;
                    line-height: 1;
                    font-family: "Poppins", sans-serif;
                    font-weight: bold;
                }

                .horiz-card-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    height: 100%;
                    padding-left: 10px;
                }

                .horiz-card-title {
                    font-size: 16px;
                    font-weight: bold;
                    color: #333;
                    line-height: 1.3;
                    position: relative;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    font-family: "Poppins", sans-serif;
                }

                .horiz-card-location {
                    padding: 0 15px 10px 15px;
                }

                .horiz-location-pill {
                    display: inline-flex;
                    align-items: center;
                    background: #4ab6f5;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-family: "Poppins", sans-serif;
                    font-weight: 500;
                }

                .horiz-location-icon {
                    margin-right: 5px;
                }

                .horiz-location-icon::before {
                    content: "📍";
                }

                .horiz-card-bottom {
                    padding: 10px 15px;
            border-top: 1px solid white;
            background: white;
                }

                .horiz-card-datetime {
                    font-size: 14px;
                    color: #333;
                    margin-bottom: 10px;
                    font-family: "Poppins", sans-serif;
                    font-weight: 500;
                }

                .horiz-card-bottom-content {
                    display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
                }

                .horiz-card-description {
                    flex: 1;
                    font-size: 14px;
                    color: #333;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    font-family: "Poppins", sans-serif;
                }

                .horiz-card-arrow {
                     width: 50px;
            height: 50px;
            border: 2px solid #333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
            text-decoration: none;
                }

                .horiz-card-arrow:hover {
                    background: #333;
                    color: white !important;
                }

                .horiz-card-arrow svg path {
            stroke: #333;
            transition: stroke 0.3s ease;
        }

        .horiz-card-arrow:hover svg path {
            stroke: white;
        }

                .swiper-pagination {
                    bottom: 0 !important;
                }

                .swiper-pagination-bullet {
                    background: #4ab6f5;
                    opacity: 0.5;
                }

                .swiper-pagination-bullet-active {
                    opacity: 1;
                }

                @media (max-width: 480px) {
                   
                    
                }
                </style>

                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />

                <div class="swiper-events-container">
                    <div class="swiper-navigation">
                        <div class="swiper-button-prev">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="#4ab6f5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="swiper-button-next">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 18L15 12L9 6" stroke="#4ab6f5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="swiper mySwiper">
                        <div class="swiper-wrapper">';

                foreach ($events as $event) {
                    $eventId = $event['Event_ID'];
                    $title = $event['Event_Title'];

                    $startRaw = $event['Event_Start_Date'] ?? '';
                    $endRaw = $event['Event_End_Date'] ?? '';


                    $location = esc_html($event['Congregation_Name'] ?? $event['Congregation_ID_Table.Congregation_Name'] ?? '');
                    // $desc = esc_html($event['Description'] ?? '');
                    $desc = esc_html(wp_strip_all_tags($event['Web_Description'] ?? ''));

                    $descTruncated = strlen($desc) > 100 ? substr($desc, 0, 100) . '...' : $desc;

                    $startDateObj = $startRaw ? new \DateTime($startRaw) : null;
                    $endDateObj = $endRaw ? new \DateTime($endRaw) : null;
                    $startMonth = $startDateObj ? strtoupper($startDateObj->format('M')) : '';
                    $startDay = $startDateObj ? $startDateObj->format('j') : '';

                    $dateDisplay = '';
                    $timeDisplay = '';

                    if ($startDateObj && $endDateObj) {
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

                    $output .= "
                        <div class='swiper-slide'>
                            <div class='event-card'>
                                <div class='horiz-card-top'>
                                    <div class='horiz-card-left'>
                                        <div class='horiz-date-circle'>
                                            <div class='horiz-date-month'>{$startMonth}</div>
                                            <div class='horiz-date-day'>{$startDay}</div>
                                        </div>
                                    </div>
                                    <div class='horiz-card-right'>
                                        <h3 class='card-title'>{$title}</h3>
                                    </div>
                                </div>
                                
                                <div class='horiz-card-location'>
                                    <div class='horiz-location-pill'>
                                        
                                        {$location}
                                    </div>
                                </div>

                                <div class='horiz-card-bottom'>
                                    <div class='horiz-card-datetime'>{$dateDisplay} | {$timeDisplay}</div>
                                    <div class='horiz-card-bottom-content'>
                                        <p class='horiz-card-description'>{$descTruncated}</p>
                                        <a href='/events?id={$eventId}' class='horiz-card-arrow' title='View Event'>
                                        <svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M13 20H27M27 20L22.5 15.5M27 20L22.5 24.5' stroke='#333' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' />
                </svg>
                </a>
                                    </div>
                                </div>
                            </div>
                        </div>";
                }

                $output .= '
                        </div>
                        <div class="swiper-pagination"></div>
                    </div>
                </div>

                <!-- Swiper JS -->
                <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

                <!-- Initialize Swiper -->
                <script>
                document.addEventListener("DOMContentLoaded", function() {
                    var swiper = new Swiper(".mySwiper", {
                        slidesPerView: 1.2,      
                        spaceBetween: 20,   
                        mousewheel: true,                         
                        navigation: {
                          nextEl: ".swiper-button-next",
                          prevEl: ".swiper-button-prev",
                        },      
                        breakpoints: {
                            480: {
                                slidesPerView: 1.5,
                                spaceBetween: 15,
                            },
                            768: {
                                slidesPerView: 2.2,
                                spaceBetween: 20,
                            },
                            1024: {
                                slidesPerView: 3.2,
                                spaceBetween: 25,
                            },
                            1200: {
                                slidesPerView: 3.3,
                                spaceBetween: 30,
                            }
                        },
                        
                    });
                });
                </script>';

                return $output;

            } catch (Exception $e) {
                error_log('Error in newSwiperEvents: ' . $e->getMessage());
                return '<p>Error loading events.</p>';
            }
        } else {
            return '<p>Authentication failed.</p>';
        }
    }



    // Shortcode to replace element content with event web description
    public static function mpapi_replace_event_description_sc($atts = [], $content = null)
    {
        // Get event ID from URL parameter
        $event_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if (!$event_id) {
            return $content; // Return original content if no ID
        }

        $mp = new MP();

        if ($mp->authenticate()) {
            try {
                $event = $mp->table('Events')
                    ->select('Web_Description')
                    ->filter("Event_ID = {$event_id}")
                    ->first();

                if ($event && !empty($event['Web_Description'])) {
                    // Output JavaScript to replace the content in Shadow DOM
                    ob_start();
                    ?>
                    <script>
                        // console.log('Replacing event description for Event ID: <?php echo $event_id; ?>');
                        // console.log('event check: <?php echo $event; ?>');
                        // console.log('New description:', <?php echo json_encode($event['Web_Description']); ?>);

                        function replaceEventDescription() {
                            // Look for the mpp-event-details element
                            var mppEventDetails = document.querySelector('mpp-event-details');
                            if (mppEventDetails && mppEventDetails.shadowRoot) {
                                // Access the shadow root
                                var shadowRoot = mppEventDetails.shadowRoot;
                                var descElement = shadowRoot.querySelector('.mpp-innerpage--description');

                                if (descElement) {
                                    descElement.innerHTML = <?php echo json_encode($event['Web_Description']); ?>;
                                    // console.log('✅ Event description replaced successfully in Shadow DOM');
                                    return true;
                                } else {
                                    console.log('⏳ Element .mpp-innerpage--description not found in Shadow DOM, retrying...');
                                    return false;
                                }
                            } else {
                                console.log('⏳ mpp-event-details or shadowRoot not found yet, retrying...');
                                return false;
                            }
                        }

                        // Try immediately
                        if (!replaceEventDescription()) {
                            // Try when DOM is ready
                            document.addEventListener('DOMContentLoaded', function () {
                                if (!replaceEventDescription()) {
                                    // Try after a short delay
                                    setTimeout(function () {
                                        if (!replaceEventDescription()) {
                                            // Try with a longer delay
                                            setTimeout(function () {
                                                if (!replaceEventDescription()) {
                                                    console.log('❌ Failed to find and replace element in Shadow DOM after multiple attempts');

                                                    // Debug: Check if the element exists
                                                    var mppEventDetails = document.querySelector('mpp-event-details');
                                                    if (mppEventDetails) {
                                                        // console.log('Found mpp-event-details element:', mppEventDetails);
                                                        // console.log('Shadow root:', mppEventDetails.shadowRoot);
                                                    } else {
                                                        console.log('mpp-event-details element not found');
                                                    }
                                                }
                                            }, 3000);
                                        }
                                    }, 1000);
                                }
                            });
                        }
                    </script>
                    <?php
                    return ob_get_clean();
                } else {
                    echo "<script>console.log('No web description found for Event ID: {$event_id}');</script>";
                    return $content;
                }

            } catch (Exception $e) {
                echo "<script>console.log('Error fetching event: " . esc_js($e->getMessage()) . "');</script>";
                return $content;
            }
        } else {
            echo "<script>console.log('Ministry Platform authentication failed');</script>";
            return $content;
        }
    }

    // -----------------------------------Group Finder-------------------------------------
    public static function mpapi_list_groups_sc($atts = [], $content = null)
    {
        $atts = shortcode_atts([
            'limit' => 50,
        ], $atts);

        $limit = intval($atts['limit']);

        // Add the CSS styles from newSwiperEvents
        $groupCardStyles = '
    <style>
    @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");
    
    .groups-container {
        max-width: 1400px;
        width: 100%;
        margin: 0 auto;
        padding: 20px;            
        font-family: Poppins, sans-serif;
    }

    .groups-card-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        justify-content: center;
        align-content: start;
    }

    .group-card {
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 0;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        min-height: 250px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .group-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
    }

    .group-card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 15px 5px 15px;
        min-height: 60px;
        height: 80px;
    }

    .group-card-left {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        flex-shrink: 0;
        height: 100%;
        justify-content: center;
    }

    .group-date-circle {
        background: #4ab6f5;
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;            
        font-family: Poppins, sans-serif;
        font-weight: bold;
        font-size: 0.8rem;
        text-align: center;
    }

    .group-date-month {
        font-size: 0.65rem;
        line-height: 1;
    }

    .group-date-day {
        font-size: 0.9rem;
        line-height: 1;
    }

    .group-card-right {
        flex: 1;
        margin-left: 15px;
        height: 100%;
        display: flex;
        align-items: center;
    }

    .group-card-location {
        padding: 10px 15px 10px 15px;
    }

    .group-location-pill {
        background: #4ab6f5;
        color: white;
        padding: 5px 12px;
        border-radius: 20px;            
        font-family: Poppins, sans-serif;
        font-size: 0.8rem;
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }

    .group-card-title {
        font-family: Poppins, sans-serif;
        font-size: 1.6em;
        font-weight: bold;
        color: #333;
        line-height: 1.3;
        position: relative;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .group-card-bottom {
        padding: 10px 15px;
        border-top: 1px solid white;
        background: white;
    }

    .group-card-datetime, .group-card-display-name {
        font-family: Poppins, sans-serif;
        color: #333;
        font-size: 0.85rem;
        font-weight: 500;
        margin-bottom: 10px;
    }

    .group-card-bottom-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
    }

    .group-card-description {
        flex: 1;
        font-family: Poppins, sans-serif;
        color: #333;
        line-height: 1.4;
        font-size: 0.9rem;
    }

    .group-card-description.truncated {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .group-card-arrow {
        width: 50px;
        height: 50px;
        border: 2px solid #333;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
        flex-shrink: 0;
        text-decoration: none;
    }

    .group-card-arrow:hover {
        background: #333;
        color: white;
    }

    .group-card-arrow svg path {
        stroke: #333;
        transition: stroke 0.3s ease;
    }

    .group-card-arrow:hover svg path {
        stroke: white;
    }

    /* Large tablets and smaller - 2 cards per row */
    @media (max-width: 1024px) {
        .groups-card-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
    }

    /* Small tablets - 2 cards per row */
    @media (max-width: 768px) {
        .groups-card-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
    }

    /* Mobile styles - 1 card per row */
    @media (max-width: 480px) {
        .groups-card-grid {
            grid-template-columns: 1fr;
            gap: 10px;
        }
        
        .group-card-top {
            padding: 12px 12px 5px 12px;
        }
        
        .group-card-location {
            padding: 0 12px 8px 12px;
        }
        
        .group-card-bottom {
            padding: 12px;
        }
    }

    .groups-card-grid {
        justify-items: stretch;
    }

    
.life-stage-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 15px;
}

.life-stage-button {
    background: #f0f0f0;
    color: #333;
    padding: 8px 15px;
    border-radius: 20px;
    border: 1px solid #ddd;
    cursor: pointer;
    font-size: 0.9rem;
    font-family: Poppins, sans-serif;
    transition: all 0.3s ease;
}

.life-stage-button:hover {
    background: #4ab6f5;
    color: white;
    border-color: #4ab6f5;
}

.life-stage-button.selected {
    background: #4ab6f5;
    color: white;
    border-color: #4ab6f5;
}

    </style>';

        // Layout with fixed right sidebar and scrollable left content
        $output = $groupCardStyles . '
    <div style="display: flex; gap: 20px; height: 80vh;">
        <!-- Left side - Scrollable Groups List -->
        <div style="flex: 75%; overflow-y: auto; padding-right: 10px;">
            <div id="groups-results">';

        $mp = new MP();

        if ($mp->authenticate()) {
            try {
                $filter = "Groups.Group_Type_ID = 1 AND Groups.Available_Online = 1 AND (Groups.End_Date IS NULL OR Groups.End_Date > GETDATE())";

                $groups = $mp->table('Groups')
                    ->select("*,Congregation_ID_Table.Congregation_ID, Congregation_ID_Table.Congregation_Name, Primary_Contact_Table.[Display_Name], Life_Stage_ID_Table.Life_Stage")
                    ->filter($filter)
                    ->get();

                echo "<script>console.log('LIFE STAGE:', " . json_encode($groups) . ");</script>";

                if (empty($groups)) {
                    $output .= '<p>No groups found.</p>';
                } else {
                    $output .= '<div class="groups-container"><div class="groups-card-grid">';
                    foreach ($groups as $group) {
                        $groupId = $group['Group_ID'];
                        $title = esc_html($group['Group_Name'] ?? '');
                        $congregationName = esc_html($group['Congregation_Name'] ?? '');
                        $displayName = esc_html($group['Display_Name'] ?? 'N/A');
                        $lifeStage = esc_html($group['Life_Stage'] ?? 'N/A');
                        $description = esc_html($group['Description'] ?? '');
                        $descTruncated = strlen($description) > 100 ? substr($description, 0, 100) . '...' : $description;

                        // Meeting day and time
                        $meetingDay = $group['Meeting_Day_ID'] ?? 'Date N/A';
                        $meetingTime = $group['Meeting_Time'] ?? 'Date N/A';
                        $timeDisplay = '';

                        if ($meetingDay && $meetingTime) {
                            $days = ['', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                            $dayName = $days[$meetingDay] ?? 'Date N/A';
                            $time = date('g:i A', strtotime($meetingTime)) ?? 'Time N/A';
                            $timeDisplay = "{$dayName} | {$time}";
                        }

                        $output .= "
                    <div class='group-card'>
                        <div class='group-card-top'>
                            <div class='group-card-left'>
                                <div class='group-date-circle'>
                                    <div class='group-date-month'>GRP</div>
                                    <div class='group-date-day'>{$groupId}</div>
                                </div>
                            </div>
                            <div class='group-card-right'>
                                <div class='group-card-title'>
                                    {$title}
                                </div>
                            </div>
                        </div>
                        <div class='group-card-location'>
                            <div class='group-location-pill'>
                                {$congregationName}
                            </div>
                        </div>
                        <div class='group-card-bottom'>
                            <div class='group-card-datetime'>
                                {$timeDisplay}
                            </div>
                            <div class='group-card-display-name'>
                                {$displayName}
                            </div>
                            <div class='group-card-display-name'>
                                {$lifeStage}
                            </div>
                            <div class='group-card-bottom-content'>
                                <div class='group-card-description truncated'>
                                    {$descTruncated}
                                </div>
                                <button class='group-card-arrow' onclick='showMap({$groupId}, \"{$title}\")' title='View Map'>
                                    <svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                        <path d='M13 20H27M27 20L22.5 15.5M27 20L22.5 24.5' stroke='#333' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>";
                    }
                    $output .= '</div></div>';
                }

            } catch (Exception $e) {
                $output .= '<p>Error: ' . esc_html($e->getMessage()) . '</p>';
            }
        } else {
            $output .= '<p>Authentication failed.</p>';
        }

        $output .= '
            </div>
        </div>
        
        <!-- Right side - Fixed Search & Filter -->
        <div style="flex: 25%; position: sticky; top: 0; height: fit-content;">
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
                <h4 style="margin-top: 0;">Search & Filter</h4>
                
                <div style="position: relative; margin-bottom: 15px;">
                    <input type="text" id="group-search" placeholder="Search groups..." 
                           style="width: 100%; padding: 12px 40px 12px 15px; border: 1px solid #ddd; border-radius: 25px; box-sizing: border-box;">
                    <svg style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: #666; pointer-events: none;" 
                         fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
                    </svg>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label for="congregation-filter" style="display: block; margin-bottom: 5px; font-weight: bold;">Campus</label>
                    <select id="congregation-filter" style="width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 5px; background: white; box-sizing: border-box;">
                        <option value="">All Campuses</option>
                    </select>
                </div>
                <div class="life-stage-container" id="life-stage-container">
    <!-- Life stage buttons will be dynamically added here -->
</div>
            </div>
        </div>
    </div>

    <script>
    document.addEventListener("DOMContentLoaded", function() {
        const searchInput = document.getElementById("group-search");
        const congregationSelect = document.getElementById("congregation-filter");
        const resultsDiv = document.getElementById("groups-results");
        
        loadCongregations();
        
        searchInput.addEventListener("input", function() {
            performSearch();
        });
        
        congregationSelect.addEventListener("change", function() {
            performSearch();
        });
        
        function loadCongregations() {
            fetch("' . admin_url('admin-ajax.php') . '", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "action=mpapi_get_congregations"
            })
            .then(response => response.json())
            .then(data => {
                congregationSelect.innerHTML = "<option value=\"\">All Campuses</option>";
                data.forEach(function(congregation) {
                    const option = document.createElement("option");
                    option.value = congregation.Congregation_ID;
                    option.textContent = congregation.Congregation_Name;
                    congregationSelect.appendChild(option);
                });
            });
        }
        
        function performSearch() {
    const searchTerm = searchInput.value.trim();
    const congregationId = congregationSelect.value;
    const selectedLifeStages = Array.from(document.querySelectorAll(".life-stage-button.selected"))
        .map(button => button.dataset.id)
        .join(",");

    fetch("' . admin_url('admin-ajax.php') . '", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "action=mpapi_search_groups_finder_ajax&search=" + encodeURIComponent(searchTerm) + 
              "&congregation_id=" + encodeURIComponent(congregationId) + 
              "&life_stages=" + encodeURIComponent(selectedLifeStages)
    })
    .then(response => response.text())
    .then(data => {
        resultsDiv.innerHTML = data;
    });
}
    });
    
    function showMap(groupId, title) {
        alert("Map for " + title + " (ID: " + groupId + ")");
        // TODO: Implement map modal
    }

function fetchLifeStages() {
    fetch("' . admin_url('admin-ajax.php') . '", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "action=mpapi_get_life_stages"
    })
    .then(response => response.json())
    .then(data => {
        const lifeStageContainer = document.getElementById("life-stage-container");
        lifeStageContainer.innerHTML = ""; // Clear any existing content

        if (Array.isArray(data)) {
            data.forEach(function(stage) {
                const button = document.createElement("button");
                button.className = "life-stage-button";
                button.dataset.id = stage.Life_Stage_ID;
                button.textContent = stage.Life_Stage;
                button.addEventListener("click", function () {
                    button.classList.toggle("selected"); // Toggle selection
                    window.performSearch(); // Call the global performSearch function
                });
                lifeStageContainer.appendChild(button);
            });
        } else {
            console.error("Unexpected response format:", data);
        }
    })
    .catch(error => {
        console.error("Error fetching life stages:", error);
    });
}

// Call the function to fetch life stages
fetchLifeStages();

// Define performSearch globally
window.performSearch = function() {
    const searchInput = document.getElementById("group-search");
    const congregationSelect = document.getElementById("congregation-filter");
    const resultsDiv = document.getElementById("groups-results");

    const searchTerm = searchInput.value.trim();
    const congregationId = congregationSelect.value;
    const selectedLifeStages = Array.from(document.querySelectorAll(".life-stage-button.selected"))
        .map(button => button.dataset.id)
        .join(",");

    fetch("' . admin_url('admin-ajax.php') . '", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "action=mpapi_search_groups_finder_ajax&search=" + encodeURIComponent(searchTerm) + 
              "&congregation_id=" + encodeURIComponent(congregationId) + 
              "&life_stages=" + encodeURIComponent(selectedLifeStages)
    })
    .then(response => response.text())
    .then(data => {
        resultsDiv.innerHTML = data;
    })
    .catch(error => {
        console.error("Error performing search:", error);
    });
};
    </script>';

        return $output;
    }

    public static function mpapi_get_congregations()
    {
        $mp = new MP();

        if ($mp->authenticate()) {
            try {
                $congregations = $mp->table('Congregations')
                    ->select("Congregation_ID, Congregation_Name")
                    ->filter('Available_Online = 1')
                    ->orderBy('Congregation_Name')
                    ->get();

                echo json_encode($congregations);
            } catch (Exception $e) {
                echo json_encode([]);
            }
        } else {
            echo json_encode([]);
        }

        wp_die();
    }

    public static function mpapi_search_groups_finder_ajax()
    {
        $search_term = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
        $congregation_id = isset($_POST['congregation_id']) ? sanitize_text_field($_POST['congregation_id']) : '';
        $life_stages = isset($_POST['life_stages']) ? sanitize_text_field($_POST['life_stages']) : '';

        $mp = new MP();

        if ($mp->authenticate()) {
            try {
                $filter = "Groups.Group_Type_ID = 1 AND Groups.Available_Online = 1 AND (Groups.End_Date IS NULL OR Groups.End_Date > GETDATE())";

                if (!empty($search_term)) {
                    $filter .= " AND Groups.Group_Name LIKE '%" . $search_term . "%'";
                }

                if (!empty($congregation_id)) {
                    $filter .= " AND Groups.Congregation_ID = " . intval($congregation_id);
                }

                if (!empty($life_stages)) {
                    $lifeStageIds = implode(',', array_map('intval', explode(',', $life_stages)));
                    $filter .= " AND Groups.Life_Stage_ID IN ({$lifeStageIds})";
                }

                $groups = $mp->table('Groups')
                    ->select("*,Congregation_ID_Table.Congregation_ID, Congregation_ID_Table.Congregation_Name, Primary_Contact_Table.[Display_Name], Life_Stage_ID_Table.Life_Stage")
                    ->filter($filter)
                    ->get();

                if (empty($groups)) {
                    echo '<p>No groups found.</p>';
                } else {
                    echo '<div class="groups-container"><div class="groups-card-grid">';
                    foreach ($groups as $group) {
                        $groupId = $group['Group_ID'];
                        $title = esc_html($group['Group_Name'] ?? '');
                        $congregationName = esc_html($group['Congregation_Name'] ?? '');
                        $displayName = esc_html($group['Display_Name'] ?? 'N/A');
                        $lifeStage = esc_html($group['Life_Stage'] ?? 'N/A');
                        $description = esc_html($group['Description'] ?? '');
                        $descTruncated = strlen($description) > 100 ? substr($description, 0, 100) . '...' : $description;

                        // Meeting day and time
                        $meetingDay = $group['Meeting_Day_ID'] ?? 'Date N/A';
                        $meetingTime = $group['Meeting_Time'] ?? 'Date N/A';
                        $timeDisplay = '';

                        if ($meetingDay && $meetingTime) {
                            $days = ['', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                            $dayName = $days[$meetingDay] ?? 'Day N/A';
                            $time = date('g:i A', strtotime($meetingTime)) ?? 'Time N/A';
                            $timeDisplay = "{$dayName} | {$time}";
                        }

                        echo "
                    <div class='group-card'>
                        <div class='group-card-top'>
                            <div class='group-card-left'>
                                <div class='group-date-circle'>
                                    <div class='group-date-month'>GRP</div>
                                    <div class='group-date-day'>{$groupId}</div>
                                </div>
                            </div>
                            <div class='group-card-right'>
                                <div class='group-card-title'>
                                    {$title}
                                </div>
                            </div>
                        </div>
                        <div class='group-card-location'>
                            <div class='group-location-pill'>
                                {$congregationName}
                            </div>
                        </div>
                        <div class='group-card-bottom'>
                            <div class='group-card-datetime'>
                                {$timeDisplay}
                            </div>
                            <div class='group-card-display-name'>
                                {$displayName}
                            </div>
                            <div class='group-card-display-name'>
                                {$lifeStage}
                            </div>
                            <div class='group-card-bottom-content'>
                                <div class='group-card-description truncated'>
                                    {$descTruncated}
                                </div>
                                <button class='group-card-arrow' onclick='showMap({$groupId}, \"{$title}\")' title='View Map'>
                                    <svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                        <path d='M13 20H27M27 20L22.5 15.5M27 20L22.5 24.5' stroke='#333' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>";
                    }
                    echo '</div></div>';
                }

            } catch (Exception $e) {
                echo '<p>Error: ' . esc_html($e->getMessage()) . '</p>';
            }
        } else {
            echo '<p>Authentication failed.</p>';
        }

        wp_die();
    }

    public static function mpapi_get_life_stages()
    {
        ob_start(); // Start output buffering

        $mp = new MP();

        if ($mp->authenticate()) {
            try {
                $lifeStages = $mp->table('Life_Stages')
                    ->select("Life_Stage_ID, Life_Stage") // Select only the required columns
                    ->orderBy('Life_Stage') // Order by the Life Stage column
                    ->get();

                // Log the query result for debugging
                error_log('Life Stages Query Result: ' . print_r($lifeStages, true));

                // Ensure the response is a valid JSON array
                echo json_encode($lifeStages);
            } catch (Exception $e) {
                // Log any exceptions
                error_log('Error in mpapi_get_life_stages: ' . $e->getMessage());
                echo json_encode([]); // Return an empty array on error
            }
        } else {
            // Log authentication failure
            error_log('Authentication failed in mpapi_get_life_stages');
            echo json_encode([]); // Return an empty array if authentication fails
        }

        $output = ob_get_clean(); // Get the buffered output
        error_log('Buffered Output: ' . $output); // Log the buffered output for debugging
        echo $output; // Send the output to the client
        wp_die();
    }

}


