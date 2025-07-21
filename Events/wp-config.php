<?php
# Database Configuration
define('DB_NAME', 'wp_calvary2024dev');
define('DB_USER', 'calvary2024dev');
define('DB_PASSWORD', 'mpf3gZjQB7P_6NV8zZDn');
define('DB_HOST', '127.0.0.1:3306');
define('DB_HOST_SLAVE', '127.0.0.1:3306');
define('DB_CHARSET', 'utf8');
define('DB_COLLATE', '');
$table_prefix = 'wp_';

# Security Salts, Keys, Etc
define('AUTH_KEY', 'z)6f__&J3@=q7ppeDn(uqjjN^~ji&rU!Vw$)30SIifuIa_o%Am6LW*G15k~MHM3C');
define('SECURE_AUTH_KEY', '4qqzLiNm$1vs=oE(6_GE+sY%OQ1x!X9tPP1fCyo^Ah4gDH6CAc=!=(AEGfZ.)-UJ');
define('LOGGED_IN_KEY', '+tNjC37f.~trhI$EQDzF^bc^0!dKNKiN6BO$-JcL?vbb^3KC=cG~~yLA,qhC,Y!H');
define('NONCE_KEY', '-Rbvm^o8Q&Q2E8qpE~9UfvUJ@xEwW.-oU7vz6aETLXms4~2GE7gSO$d(b!dodb%-');
define('AUTH_SALT', 'dnZC%2LUvfFSY2+#KwJ%c5WV)r$86+t1sl)^qh-bG+m3,+2R.2Ye_Pa,eJP+#Ba2');
define('SECURE_AUTH_SALT', 'Wq($BU^gEVL+Ib0Zg$TWmaFg,n9BmVkourhfU5KabP*dv%EqXM(PJPr.l!#sq*2,');
define('LOGGED_IN_SALT', 'jd8,xjM,=4oC5kc7!O)#1V.Ms*S5x,F5~HAiP9TQGS.Zeit.?sAEpz=Q^$eoqc=@');
define('NONCE_SALT', 'ogVkZhSp3Cqfajk(T68p@~jjj&1FkB5QS@FS.NHrO-MbH2%Z2LxQB+TK4s?DC_=l');

define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false); // prevents showing error to users


# Localized Language Stuff

define('WP_CACHE', TRUE);

define('WP_AUTO_UPDATE_CORE', false);

define('PWP_NAME', 'calvary2024dev');

define('FS_METHOD', 'direct');

define('FS_CHMOD_DIR', 0775);

define('FS_CHMOD_FILE', 0664);

define('WPE_APIKEY', '60f53444d9d2c9980df0708eec870d9008169547');

define('WPE_CLUSTER_ID', '226454');

define('WPE_CLUSTER_TYPE', 'pod');

define('WPE_ISP', true);

define('WPE_BPOD', false);

define('WPE_RO_FILESYSTEM', false);

define('WPE_LARGEFS_BUCKET', 'largefs.wpengine');

define('WPE_SFTP_PORT', 2222);

define('WPE_SFTP_ENDPOINT', '34.23.111.240');

define('WPE_LBMASTER_IP', '');

define('WPE_CDN_DISABLE_ALLOWED', true);

define('DISALLOW_FILE_MODS', FALSE);

define('DISALLOW_FILE_EDIT', FALSE);

define('DISABLE_WP_CRON', false);

define('WPE_FORCE_SSL_LOGIN', false);

define('FORCE_SSL_LOGIN', false);

/*SSLSTART*/
if (isset($_SERVER['HTTP_X_WPE_SSL']) && $_SERVER['HTTP_X_WPE_SSL'])
    $_SERVER['HTTPS'] = 'on'; /*SSLEND*/

define('WPE_EXTERNAL_URL', false);

define('WP_POST_REVISIONS', FALSE);

define('WPE_WHITELABEL', 'wpengine');

define('WP_TURN_OFF_ADMIN_BAR', false);

define('WPE_BETA_TESTER', false);

umask(0002);

$wpe_cdn_uris = array();

$wpe_no_cdn_uris = array();

$wpe_content_regexs = array();

$wpe_all_domains = array(0 => 'calvary2024dev.wpengine.com', 1 => 'calvary2024dev.wpenginepowered.com', );

$wpe_varnish_servers = array(0 => '127.0.0.1', );

$wpe_special_ips = array(0 => '34.75.244.66', 1 => 'pod-226454-utility.pod-226454.svc.cluster.local', );

$wpe_netdna_domains = array();

$wpe_netdna_domains_secure = array();

$wpe_netdna_push_domains = array();

$wpe_domain_mappings = array();

$memcached_servers = array('default' => array(0 => 'unix:///tmp/memcached.sock', ), );


# WP Engine ID


# WP Engine Settings








# That's It. Pencils down
if (!defined('ABSPATH'))
    define('ABSPATH', __DIR__ . '/');
require_once(ABSPATH . 'wp-settings.php');


