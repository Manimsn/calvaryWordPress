<?php
/**
 * Juxt Marketing Child Theme
 * Functions.php
 *
 * ===== NOTES ==================================================================
 *
 * Unlike style.css, the functions.php of a child theme does not override its
 * counterpart from the parent. Instead, it is loaded in addition to the parent's
 * functions.php. (Specifically, it is loaded right before the parent's file.)
 *
 *
 * =============================================================================== */



/**
 * Adjusting Toggle Animation Speed
 */

/**
 *
 *
 */



/** Adding functions for using Relevanessi */
add_action('pre_get_posts', function () {
    unset($_GET['et_pb_searchform_submit']);
}, 1);

add_filter('relevanssi_pre_excerpt_content', 'rlv_shortcode_attribute', 8);
add_filter('relevanssi_post_content', 'rlv_shortcode_attribute', 8);

function rlv_shortcode_attribute($content)
{
    return preg_replace('/\[et_pb_blurb.*?title="(.*?)".*?\]/im', '\1 ', $content);
}

add_filter('et_use_dynamic_css', function () {
    if (is_search()) {
        return false;
    }
});

/** END functions for using Relevanessi */

function juxtmarketing_enqueue_scripts()
{
    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');
}
add_action('wp_enqueue_scripts', 'juxtmarketing_enqueue_scripts');


function registerCustomAdminCss()
{
    $src = "/wp-content/themes/divi-child/custom-admin-css.css";
    $handle = "customAdminCss";
    wp_register_script($handle, $src);
    wp_enqueue_style($handle, $src, array(), false, false);
}
add_action('admin_head', 'registerCustomAdminCss');

add_filter('et_pb_module_shortcode_attributes', 'dbcAllowEmptyButtonText', 10, 3);
function dbcAllowEmptyButtonText($props, $atts, $render_slug)
{
    if ($render_slug !== 'et_pb_button')
        return $props;
    if (!is_array($props))
        return $props;
    if (!empty($props['button_text']))
        return $props;
    $props['button_text'] = ' ';
    return $props;
}

function cache_admin_ajax_requests($request)
{
    $cache_key = 'admin_ajax_' . md5(serialize($request));
    $excluded_actions = ['wp_refresh_dashboard', 'heartbeat', 'update_plugin', 'login', 'checkout'];
    if (in_array($_REQUEST['action'], $excluded_actions)) {
        return; // Skip caching
    }
    if (is_user_logged_in()) {
        return; // Skip caching for logged-in users
    }
    $cached_response = get_transient($cache_key);

    if (false !== $cached_response) {
        return $cached_response;
    }

    ob_start();
    do_action('wp_ajax_' . $_REQUEST['action']);
    $response = ob_get_clean();

    set_transient($cache_key, $response, 120); // Cache for 2 minutes

    return $response;
}
add_action('wp_ajax_nopriv_your_action', 'cache_admin_ajax_requests');
add_action('wp_ajax_your_action', 'cache_admin_ajax_requests');


function show_certificate_iframe($atts)
{
    // Get shortcode attributes
    $atts = shortcode_atts(
        array(
            'name' => '',
            'year' => '',
            'month' => '',
            'date' => '',
        ),
        $atts,
        'certificate_iframe'
    );

    $name = urlencode($atts['name']);
    $year = urlencode($atts['year']);
    $month = urlencode($atts['month']);
    $date = urlencode($atts['date']);

    $iframe = '<iframe 
        src="https://calvaryftlv1.wpenginepowered.com/certificate/en.php?name=' . $name . '&year=' . $year . '&month=' . $month . '&date=' . $date . '" 
        frameborder="0" 
        style="overflow:hidden;height:450px;width:60%">
    </iframe>';

    return $iframe;
}
add_shortcode('certificate_iframe', 'show_certificate_iframe');


function show_token_name_shortcode()
{
    ob_start();
    ?>
    <div id="token-name-display">
        <p>Loading name from token...</p>
    </div>

    <script>
        function parseJwt(token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = decodeURIComponent(atob(base64Url).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                return JSON.parse(base64);
            } catch (e) {
                return null;
            }
        }

        document.addEventListener('DOMContentLoaded', function () {
            const token = localStorage.getItem('mpp-widgets_AuthToken');
            const nameDiv = document.getElementById('token-name-display');

            if (!token) {
                nameDiv.innerHTML = "<p>No token found.</p>";
                return;
            }

            const payload = parseJwt(token);
            const name = payload?.name;

            if (name) {
                nameDiv.innerHTML = "<p><strong>Name from token:</strong> " + name + "</p>";
            } else {
                nameDiv.innerHTML = "<p>Could not read name from token.</p>";
            }
        });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('show_token_name', 'show_token_name_shortcode');


function custom_login_form_function()
{
    ob_start();
    ?>
    <style>
        .login-email {
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
            border: 1px solid #ccc;
            font-size: 16px;
            background-color: white;
            cursor: text;
            transition: background-color 0.3s, cursor 0.3s;
        }

        /* Disabled state styling */
        .login-email:disabled {
            background-color: #e9ecef !important;
            cursor: not-allowed !important;
            color: #6c757d;
        }
    </style>



    <div id="login-section"
        style="max-width: 400px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="text-align: center;">Login</h2>

        <!-- Email Input -->
        <!-- <input type="text" id="login-email" placeholder="Enter Email or Phone"
            style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 4px; border: 1px solid #ccc;" /> -->
        <input type="text" id="login-email" class="login-email" placeholder="Enter Email or Phone" />


        <!-- OTP Inputs (Hidden Initially) -->
        <div id="otp-section" style="display: none; text-align: center; margin-bottom: 20px;">
            <p>Enter OTP:</p>
            <div id="otp-inputs" style="display: flex; justify-content: space-between; gap: 10px;">
                <input type="text" maxlength="1" style="width: 40px; height: 40px; text-align: center; font-size: 18px;"
                    oninput="moveToNext(this, 0)" />
                <input type="text" maxlength="1" style="width: 40px; height: 40px; text-align: center; font-size: 18px;"
                    oninput="moveToNext(this, 1)" />
                <input type="text" maxlength="1" style="width: 40px; height: 40px; text-align: center; font-size: 18px;"
                    oninput="moveToNext(this, 2)" />
                <input type="text" maxlength="1" style="width: 40px; height: 40px; text-align: center; font-size: 18px;"
                    oninput="moveToNext(this, 3)" />
                <input type="text" maxlength="1" style="width: 40px; height: 40px; text-align: center; font-size: 18px;"
                    oninput="moveToNext(this, 4)" />
                <input type="text" maxlength="1" style="width: 40px; height: 40px; text-align: center; font-size: 18px;"
                    oninput="moveToNext(this, 5)" />
            </div>
        </div>

        <!-- Action Button -->
        <button id="action-button" onclick="handleLogin()"
            style="width: 100%; padding: 12px; border: none; border-radius: 4px; background-color: #007bff; color: white; font-size: 16px; cursor: pointer;">
            Send OTP
        </button>
    </div>

    <script>
        let otpSent = false;

        async function handleLogin() {
            if (!otpSent) {
                await sendLoginCode();
            } else {
                await verifyLoginCode();
            }
        }

        async function sendLoginCode() {
            const email = document.getElementById('login-email').value.trim();
            console.log('Attempting to send code to:', email);

            try {
                const response = await fetch('https://mobileserver.calvaryftl.org/v1.0/api/LoginCode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Phone_Email: email })
                });

                const data = await response.json();
                console.log('API response:', data);

                if (response.ok) {
                    alert(data);
                    otpSent = true;

                    document.getElementById('otp-section').style.display = 'block';
                    document.getElementById('action-button').innerText = 'Verify OTP';
                    // document.getElementById('login-email').disabled = true;
                    // document.getElementById('login-email').style.backgroundColor = '#e9ecef';
                    // document.getElementById('login-email').style.cursor = 'not-allowed';
                    const emailInput = document.getElementById('login-email');
                    emailInput.disabled = true;
                    emailInput.classList.remove('input-enabled');
                    emailInput.classList.add('input-disabled');


                } else if (response.status === 404) {
                    alert(data);
                } else {
                    alert('Something went wrong. Please try again.');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                alert('An error occurred while sending the code.');
            }
        }

        async function verifyLoginCode() {
            const email = document.getElementById('login-email').value.trim();
            const otpInputs = document.querySelectorAll('#otp-inputs input');
            const otp = Array.from(otpInputs).map(input => input.value).join('');

            console.log('Verifying OTP for:', email, 'with code:', otp);

            try {
                const response = await fetch('https://mobileserver.calvaryftl.org/v1.0/api/LoginCode/Confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        Phone_Email: email,
                        Code: otp,
                        DeviceID: 'string',
                        API_Key: 'string'
                    })
                });

                const data = await response.json();
                console.log('OTP verification response:', data);

                if (response.ok) {
                    alert('Login Successful!');
                    console.log('JWT Token:', data.JwtToken);
                    // localStorage.setItem('jwtToken', data.JwtToken);
                    // window.location.href = '/dashboard'; // Optional: Redirect after success
                } else if (response.status === 401) {
                    alert('Invalid or expired code. Please try again.');
                } else {
                    alert('Something went wrong during OTP verification.');
                }
            } catch (error) {
                console.error('Fetch error during OTP verification:', error);
                alert('An error occurred while verifying the code.');
            }
        }

        function moveToNext(currentInput, index) {
            if (currentInput.value.length === 1) {
                const inputs = document.querySelectorAll('#otp-inputs input');
                if (index + 1 < inputs.length) {
                    inputs[index + 1].focus();
                }
            }
        }
    </script>
    <?php
    return ob_get_clean();
}

add_shortcode('custom_login_form', 'custom_login_form_function');


function enqueue_custom_login_scripts() {
    wp_enqueue_script(
        'main-script',
        get_stylesheet_directory_uri() . '/assets/js/main.js',
        [],
        null,
        true // Load in footer
    );
}
add_action('wp_enqueue_scripts', 'enqueue_custom_login_scripts');

