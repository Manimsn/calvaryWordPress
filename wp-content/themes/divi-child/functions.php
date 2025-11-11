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
        src="https://calvaryftl.org/certificate/en.php?name=' . $name . '&year=' . $year . '&month=' . $month . '&date=' . $date . '" 
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


function enqueue_custom_login_validation_script()
{
    // Enqueue only on front end
    if (!is_admin()) {
        wp_enqueue_script(
            'login-validation',
            get_stylesheet_directory_uri() . '/js/login-validation.js',
            array(), // No dependencies
            '1.0',
            true // Load in footer
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_custom_login_validation_script');

function enqueue_custom_my_account_script()
{
    if (is_page('my-account-page/')) {
        wp_enqueue_script(
            'my-account',
            get_stylesheet_directory_uri() . '/js/my-account.js',
            array(), // No dependencies
            '1.0',
            true // Load in footer
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_custom_my_account_script');

function enqueue_custom_my_giving_script()
{
    if (is_page('my-giving-page/')) {
        wp_enqueue_script(
            'my-giving',
            get_stylesheet_directory_uri() . '/js/my-giving.js',
            array(), // No dependencies
            '1.0',
            true // Load in footer
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_custom_my_giving_script');

function enqueue_custom_edit_profile_script()
{
    if (is_page('edit-profile/')) {
        wp_enqueue_script(
            'edit-profile',
            get_stylesheet_directory_uri() . '/js/edit-profile.js',
            array(), // No dependencies
            '1.0',
            true // Load in footer
        );
    }
}
add_action('wp_enqueue_scripts', 'enqueue_custom_edit_profile_script');

// Adobe Target Integration
function add_adobe_target_to_site()
{
    ?>
    <!-- Adobe Target at.js -->
    <script src="https://my.calvaryftl.org/widgets/Content/at.js"></script>
    <script>
        // Initialize Adobe Target
        document.addEventListener('DOMContentLoaded', function () {
            console.log('Adobe Target loaded');
            if (typeof adobe !== 'undefined' && adobe.target) {
                console.log('Adobe Target is ready!');
                // Trigger view for SPA support
                adobe.target.triggerView("homepage");
            }
        });
    </script>
    <?php
}
add_action('wp_head', 'add_adobe_target_to_site');

// Add Target-ready classes to body
function add_target_body_class($classes)
{
    $classes[] = 'adobe-target-enabled';
    return $classes;
}
add_filter('body_class', 'add_target_body_class');


// Enhanced Adobe Target Integration
function add_enhanced_adobe_target()
{
    ?>
    <!-- Adobe Target at.js -->
    <script src="https://my.calvaryftl.org/widgets/Content/at.js"></script>
    <script>
        // Global Target configuration
        window.targetGlobalSettings = {
            timeout: 3000,
            visitorApiTimeout: 2000,
            enabled: true
        };

        // User detection functions
        function detectUserType() {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
            const hasVisited = localStorage.getItem('calvary_has_visited') === 'true';
            const sessionCount = parseInt(localStorage.getItem('calvary_session_count') || '0');

            // Update visit tracking
            if (!hasVisited) {
                localStorage.setItem('calvary_has_visited', 'true');
                localStorage.setItem('calvary_first_visit', new Date().toISOString());
            }
            localStorage.setItem('calvary_session_count', (sessionCount + 1).toString());
            localStorage.setItem('calvary_last_visit', new Date().toISOString());

            return {
                isMobile: isMobile,
                isReturning: hasVisited,
                sessionCount: sessionCount + 1,
                deviceType: isMobile ? 'mobile' : 'desktop',
                userCategory: isMobile ? 'mobile' : (hasVisited ? 'returning' : 'new')
            };
        }

        // Initialize Adobe Target when ready
        document.addEventListener('DOMContentLoaded', function () {
            console.log('🎯 Adobe Target: Initializing...');

            const userInfo = detectUserType();
            console.log('👤 User Info:', userInfo);

            // Add user type to body class for CSS targeting
            document.body.classList.add('target-user-' + userInfo.userCategory);
            document.body.classList.add('target-device-' + userInfo.deviceType);

            // Wait for Adobe Target to load
            function waitForTarget(attempts = 0) {
                if (typeof adobe !== 'undefined' && adobe.target) {
                    console.log('✅ Adobe Target: Ready!');
                    initializePersonalization(userInfo);
                } else if (attempts < 50) { // Wait up to 5 seconds
                    setTimeout(() => waitForTarget(attempts + 1), 100);
                } else {
                    console.error('❌ Adobe Target: Failed to load');
                }
            }
            waitForTarget();
        });

        function initializePersonalization(userInfo) {
            // Set global parameters for all mboxes
            window.targetPageParams = function () {
                return {
                    'userCategory': userInfo.userCategory,
                    'deviceType': userInfo.deviceType,
                    'isMobile': userInfo.isMobile.toString(),
                    'isReturning': userInfo.isReturning.toString(),
                    'sessionCount': userInfo.sessionCount.toString(),
                    'pageName': document.title,
                    'pageUrl': window.location.href,
                    'timeOfDay': new Date().getHours().toString(),
                    'dayOfWeek': new Date().getDay().toString()
                };
            };

            console.log('🔧 Target Parameters:', window.targetPageParams());

            // Trigger view for SPA support
            adobe.target.triggerView("homepage", {
                page: true
            });
        }
    </script>
    <?php
}

// Replace existing function
remove_action('wp_head', 'add_adobe_target_to_site');
add_action('wp_head', 'add_enhanced_adobe_target');

// Add Target-ready classes to body
function add_enhanced_target_body_class($classes)
{
    $classes[] = 'adobe-target-enabled';
    $classes[] = 'target-ready';
    return $classes;
}
add_filter('body_class', 'add_enhanced_target_body_class');

// Enhanced personalization with specific mboxes
function add_comprehensive_personalization()
{
    ?>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            // Wait for Target initialization
            setTimeout(function () {
                if (typeof adobe !== 'undefined' && adobe.target) {
                    setupPersonalizationTargets();
                }
            }, 1000);
        });

        function setupPersonalizationTargets() {
            console.log('🎨 Setting up personalization targets...');

            // 1. Hero Section Personalization
            setupHeroPersonalization();

            // 2. Navigation Personalization
            setupNavigationPersonalization();

            // 3. Button Personalization
            setupButtonPersonalization();

            // 4. Content Block Personalization
            setupContentPersonalization();
        }

        function setupHeroPersonalization() {
            const heroSection = document.querySelector('.et_pb_section');
            if (heroSection) {
                heroSection.setAttribute('data-mbox', 'hero-section');

                adobe.target.getOffer({
                    mbox: 'hero-section',
                    success: function (offer) {
                        console.log('🏠 Hero personalization applied');
                        adobe.target.applyOffer({
                            mbox: 'hero-section',
                            offer: offer
                        });
                    },
                    error: function (status, error) {
                        console.log('❌ Hero personalization error:', error);
                    }
                });
            }
        }

        function setupNavigationPersonalization() {
            const navigation = document.querySelector('.et_pb_menu, .et-menu, #main-header');
            if (navigation) {
                navigation.setAttribute('data-mbox', 'main-navigation');

                adobe.target.getOffer({
                    mbox: 'main-navigation',
                    success: function (offer) {
                        console.log('🧭 Navigation personalization applied');
                        adobe.target.applyOffer({
                            mbox: 'main-navigation',
                            offer: offer
                        });
                    }
                });
            }
        }

        function setupButtonPersonalization() {
            const buttons = document.querySelectorAll('.et_pb_button');
            buttons.forEach(function (button, index) {
                const mboxName = 'cta-button-' + index;
                button.setAttribute('data-mbox', mboxName);

                adobe.target.getOffer({
                    mbox: mboxName,
                    success: function (offer) {
                        console.log('🔘 Button ' + index + ' personalization applied');
                        adobe.target.applyOffer({
                            mbox: mboxName,
                            offer: offer
                        });
                    }
                });
            });
        }

        function setupContentPersonalization() {
            // Personalize specific content modules
            const contentModules = document.querySelectorAll('.et_pb_blurb, .et_pb_text');
            contentModules.forEach(function (module, index) {
                if (index < 3) { // Limit to first 3 modules
                    const mboxName = 'content-module-' + index;
                    module.setAttribute('data-mbox', mboxName);

                    adobe.target.getOffer({
                        mbox: mboxName,
                        success: function (offer) {
                            console.log('📄 Content module ' + index + ' personalization applied');
                            adobe.target.applyOffer({
                                mbox: mboxName,
                                offer: offer
                            });
                        }
                    });
                }
            });
        }

        // Track custom events
        function trackTargetEvent(eventName, additionalParams = {}) {
            if (typeof adobe !== 'undefined' && adobe.target) {
                const params = Object.assign(window.targetPageParams(), additionalParams);
                adobe.target.trackEvent({
                    mbox: eventName,
                    params: params
                });
                console.log('📊 Tracked event:', eventName, params);
            }
        }

        // Auto-track common events
        setTimeout(function () {
            // Track page engagement after 10 seconds
            trackTargetEvent('page-engagement-10s');
        }, 10000);

        // Track scroll depth
        let scrollTracked = false;
        window.addEventListener('scroll', function () {
            if (!scrollTracked && (window.scrollY > document.body.scrollHeight * 0.5)) {
                trackTargetEvent('scroll-50-percent');
                scrollTracked = true;
            }
        });
    </script>
    <?php
}

// Replace existing personalization function
remove_action('wp_footer', 'add_simple_personalization');
add_action('wp_footer', 'add_comprehensive_personalization');