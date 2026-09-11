/*!
 * Qobuz for Lampa — v0.4.5
 * Lampa 3.x compatible component pattern.
 */
(function () {
    'use strict';

    var plugin = {
        name: 'Qobuz',
        version: '0.4.8',
        component: 'qobuz_lampa'
    };

    if (window['plugin_' + plugin.component + '_ready']) return;

    var STORAGE = 'qobuz_lampa_settings';

    function settings() {
        return Lampa.Storage.get(STORAGE, {
            apiBase: 'https://www.qobuz.com/api.json/0.2',
            appId: '798273057',
            userAuthToken: ''
        });
    }

    function esc(v) {
        return $('<div>').text(v == null ? '' : String(v)).html();
    }

    function image(v) {
        if (!v) return '';

        if (typeof v === 'object') {
            v = v.large || v.big || v.medium || v.small || v.thumbnail || v.original || '';
        }

        return String(v || '').replace(/\{size\}/g, '600');
    }

    function imageOf(x) {
        x = x || {};

        var value = x.image || x.image_url || x.cover;

        if (!value && x.album) {
            value = x.album.image || x.album.image_url || x.album.cover;
        }

        if (!value && x.artist) {
            value = x.artist.image || x.artist.image_url;
        }

        return image(value);
    }

    function duration(sec) {
        sec = parseInt(sec || 0, 10);
        return sec ? Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0') : '';
    }

    function normalizeToken(value) {
        var token = String(value || '').trim();

        // Users often paste the value including JSON quotes.
        if (token.length >= 2 && token.charAt(0) === '"' && token.charAt(token.length - 1) === '"') {
            token = token.substring(1, token.length - 1);
        }

        return token;
    }

    // Minimal MD5 implementation used for the legacy Qobuz request signature.
    function md5(input) {
        function add32(a, b) { return (a + b) & 0xFFFFFFFF; }
        function rol(x, c) { return (x << c) | (x >>> (32 - c)); }
        function cmn(q, a, b, x, s, t) { return add32(rol(add32(add32(a, q), add32(x, t)), s), b); }
        function ff(a,b,c,d,x,s,t) { return cmn((b & c) | ((~b) & d),a,b,x,s,t); }
        function gg(a,b,c,d,x,s,t) { return cmn((b & d) | (c & (~d)),a,b,x,s,t); }
        function hh(a,b,c,d,x,s,t) { return cmn(b ^ c ^ d,a,b,x,s,t); }
        function ii(a,b,c,d,x,s,t) { return cmn(c ^ (b | (~d)),a,b,x,s,t); }
        var str = unescape(encodeURIComponent(String(input)));
        var n = str.length;
        var words = [];
        for (var i=0;i<n;i++) words[i>>2] = (words[i>>2] || 0) | (str.charCodeAt(i) << ((i%4)*8));
        words[n>>2] = (words[n>>2] || 0) | (0x80 << ((n%4)*8));
        words[(((n + 8) >> 6) + 1) * 16 - 2] = n * 8;
        var a=0x67452301,b=0xEFCDAB89,c=0x98BADCFE,d=0x10325476;
        for (var k=0;k<words.length;k+=16) {
            var oa=a, ob=b, oc=c, od=d;
            a=ff(a,b,c,d,words[k+0]||0,7,-680876936); d=ff(d,a,b,c,words[k+1]||0,12,-389564586); c=ff(c,d,a,b,words[k+2]||0,17,606105819); b=ff(b,c,d,a,words[k+3]||0,22,-1044525330);
            a=ff(a,b,c,d,words[k+4]||0,7,-176418897); d=ff(d,a,b,c,words[k+5]||0,12,1200080426); c=ff(c,d,a,b,words[k+6]||0,17,-1473231341); b=ff(b,c,d,a,words[k+7]||0,22,-45705983);
            a=ff(a,b,c,d,words[k+8]||0,7,1770035416); d=ff(d,a,b,c,words[k+9]||0,12,-1958414417); c=ff(c,d,a,b,words[k+10]||0,17,-42063); b=ff(b,c,d,a,words[k+11]||0,22,-1990404162);
            a=ff(a,b,c,d,words[k+12]||0,7,1804603682); d=ff(d,a,b,c,words[k+13]||0,12,-40341101); c=ff(c,d,a,b,words[k+14]||0,17,-1502002290); b=ff(b,c,d,a,words[k+15]||0,22,1236535329);
            a=gg(a,b,c,d,words[k+1]||0,5,-165796510); d=gg(d,a,b,c,words[k+6]||0,9,-1069501632); c=gg(c,d,a,b,words[k+11]||0,14,643717713); b=gg(b,c,d,a,words[k+0]||0,20,-373897302);
            a=gg(a,b,c,d,words[k+5]||0,5,-701558691); d=gg(d,a,b,c,words[k+10]||0,9,38016083); c=gg(c,d,a,b,words[k+15]||0,14,-660478335); b=gg(b,c,d,a,words[k+4]||0,20,-405537848);
            a=gg(a,b,c,d,words[k+9]||0,5,568446438); d=gg(d,a,b,c,words[k+14]||0,9,-1019803690); c=gg(c,d,a,b,words[k+3]||0,14,-187363961); b=gg(b,c,d,a,words[k+8]||0,20,1163531501);
            a=gg(a,b,c,d,words[k+13]||0,5,-1444681467); d=gg(d,a,b,c,words[k+2]||0,9,-51403784); c=gg(c,d,a,b,words[k+7]||0,14,1735328473); b=gg(b,c,d,a,words[k+12]||0,20,-1926607734);
            a=hh(a,b,c,d,words[k+5]||0,4,-378558); d=hh(d,a,b,c,words[k+8]||0,11,-2022574463); c=hh(c,d,a,b,words[k+11]||0,16,1839030562); b=hh(b,c,d,a,words[k+14]||0,23,-35309556);
            a=hh(a,b,c,d,words[k+1]||0,4,-1530992060); d=hh(d,a,b,c,words[k+4]||0,11,1272893353); c=hh(c,d,a,b,words[k+7]||0,16,-155497632); b=hh(b,c,d,a,words[k+10]||0,23,-1094730640);
            a=hh(a,b,c,d,words[k+13]||0,4,681279174); d=hh(d,a,b,c,words[k+0]||0,11,-358537222); c=hh(c,d,a,b,words[k+3]||0,16,-722521979); b=hh(b,c,d,a,words[k+6]||0,23,76029189);
            a=hh(a,b,c,d,words[k+9]||0,4,-640364487); d=hh(d,a,b,c,words[k+12]||0,11,-421815835); c=hh(c,d,a,b,words[k+15]||0,16,530742520); b=hh(b,c,d,a,words[k+2]||0,23,-995338651);
            a=ii(a,b,c,d,words[k+0]||0,6,-198630844); d=ii(d,a,b,c,words[k+7]||0,10,1126891415); c=ii(c,d,a,b,words[k+14]||0,15,-1416354905); b=ii(b,c,d,a,words[k+5]||0,21,-57434055);
            a=ii(a,b,c,d,words[k+12]||0,6,1700485571); d=ii(d,a,b,c,words[k+3]||0,10,-1894986606); c=ii(c,d,a,b,words[k+10]||0,15,-1051523); b=ii(b,c,d,a,words[k+1]||0,21,-2054922799);
            a=ii(a,b,c,d,words[k+8]||0,6,1873313359); d=ii(d,a,b,c,words[k+15]||0,10,-30611744); c=ii(c,d,a,b,words[k+6]||0,15,-1560198380); b=ii(b,c,d,a,words[k+13]||0,21,1309151649);
            a=ii(a,b,c,d,words[k+4]||0,6,-145523070); d=ii(d,a,b,c,words[k+11]||0,10,-1120210379); c=ii(c,d,a,b,words[k+2]||0,15,718787259); b=ii(b,c,d,a,words[k+9]||0,21,-343485551);
            a=add32(a,oa); b=add32(b,ob); c=add32(c,oc); d=add32(d,od);
        }
        function hex(x){var s='',i;for(i=0;i<4;i++)s+=('0'+((x>>>(i*8))&255).toString(16)).slice(-2);return s;}
        return hex(a)+hex(b)+hex(c)+hex(d);
    }

    var QOBUZ_SECRETS = [
        'abb21364945c0583309667d13ca3d93a',
        '05a4851e74ee47fda346f50cfdfc4f09'
    ];

    function request(path, data, ok, fail) {
        var s = settings();
        var appId = String(s.appId || '798273057').trim();
        var token = normalizeToken(s.userAuthToken);
        var params = $.extend({}, data || {});
        var query = [];

        var signed = data && data.__qobuz_signed;
        delete params.__qobuz_signed;
        params.app_id = appId;

        if (signed) {
            var requestTs = Math.floor(Date.now() / 1000);
            var secret = String((data && data.__qobuz_secret) || QOBUZ_SECRETS[0]);
            delete params.__qobuz_secret;
            var signatureSource = path.replace(/\//g, '') +
                'format_id' + String(params.format_id || '') +
                'intent' + String(params.intent || '') +
                'track_id' + String(params.track_id || '') +
                String(requestTs) + secret;
            params.request_ts = requestTs;
            params.request_sig = md5(signatureSource);
        }

        if (token) params.user_auth_token = token;

        Object.keys(params).forEach(function (key) {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
        });

        var url = 'https://www.qobuz.com/api.json/0.2/' +
            path.replace(/^\//, '') + '?' + query.join('&');

        var network = new Lampa.Reguest();
        network.timeout(25000);

        var headers = {
            'Accept': 'application/json, text/plain, */*',
            'X-App-Id': appId,
            'X-User-Auth-Token': token,
            'User-Agent': 'Mozilla/5.0'
        };

        network.silent(
            url,
            function (response) {
                var json = response;

                // Use text mode below so this works consistently across Lampa builds.
                try {
                    if (typeof response === 'string') {
                        json = JSON.parse(response);
                    }
                } catch (e) {
                    if (fail) fail('Qobuz: ответ не является JSON');
                    return;
                }

                if (!json || typeof json !== 'object') {
                    if (fail) fail('Qobuz: пустой ответ');
                    return;
                }

                if (json.code || json.status === 'error') {
                    if (fail) {
                        fail(
                            'HTTP/API ' + (json.code || '') +
                            (json.message ? ': ' + json.message : '')
                        );
                    }
                    return;
                }

                ok(json);
            },
            function (a, b) {
                var message = '';

                if (typeof a === 'string') message = a;
                else if (a && a.message) message = a.message;
                else if (b && b.message) message = b.message;

                if (!message) message = 'Сетевая ошибка Qobuz';

                if (fail) fail(message);
            },
            false,
            {
                dataType: 'text',
                headers: headers
            }
        );

        return network;
    }


    function searchQobuz(query, done, fail) {
        var result = {
            albums: { items: [] },
            artists: { items: [] },
            tracks: { items: [] }
        };

        var pending = 3;
        var failed = false;

        function finish() {
            pending--;
            if (pending <= 0 && !failed) done(result);
        }

        function extract(data, key) {
            if (!data) return { items: [] };

            // Normal Qobuz response: {albums:{items:[]}}
            if (data[key]) {
                if (Array.isArray(data[key])) return { items: data[key] };
                if (data[key].items) return data[key];
            }

            // Some wrappers return the list directly.
            if (Array.isArray(data)) return { items: data };

            return { items: [] };
        }

        function one(path, key) {
            request(path, {
                query: query,
                limit: 50,
                offset: 0
            }, function (data) {
                result[key] = extract(data, key);
                finish();
            }, function (message) {
                if (!failed) {
                    failed = true;
                    fail(message);
                }
            });
        }

        one('album/search', 'albums');
        one('artist/search', 'artists');
        one('track/search', 'tracks');
    }


    function css() {
        if ($('#qobuz-lampa-css').length) return;

        $('<style id="qobuz-lampa-css">' +
            '.qobuz-page{padding:2em;box-sizing:border-box;min-height:100%;}' +
            '.qobuz-search{display:flex;gap:1em;margin-bottom:2em;}' +
            '.qobuz-input{flex:1;min-width:0;padding:.8em 1em;border:0;border-radius:.5em;background:rgba(255,255,255,.1);color:inherit;font-size:1em;outline:0;}' +
            '.qobuz-button{padding:.8em 1.3em;border-radius:.5em;background:rgba(255,255,255,.12);}' +
            '.qobuz-title{font-size:2em;font-weight:bold;margin:1em 0;}' +
            '.qobuz-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(10em,1fr));gap:1.2em;}' +
            '.qobuz-card{min-width:0;}' +
            '.qobuz-cover{width:100%;aspect-ratio:1;background:rgba(255,255,255,.08);border-radius:.5em;overflow:hidden;}' +
            '.qobuz-cover img{width:100%;height:100%;object-fit:cover;}' +
            '.qobuz-name{font-weight:bold;margin-top:.5em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.qobuz-sub{opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.qobuz-row{display:flex;gap:1em;align-items:center;padding:1em;border-radius:.4em;}' +
            '.qobuz-row.focus{background:rgba(255,255,255,.12);}' +
            '.qobuz-num{width:2em;opacity:.5;text-align:center;}' +
            '.qobuz-track{flex:1;}.qobuz-time{opacity:.5;}' +
            '.qobuz-head{display:flex;gap:2em;align-items:center;margin-bottom:2em;}' +
            '.qobuz-head img{width:12em;height:12em;object-fit:cover;border-radius:.5em;}' +
            '.qobuz-message{padding:3em;text-align:center;opacity:.7;}' +
            '.qobuz-audio{min-height:100%;padding:2em;box-sizing:border-box;display:flex;align-items:center;justify-content:center;}' +
            '.qobuz-audio-box{width:min(34em,100%);text-align:center;}' +
            '.qobuz-audio-cover{width:min(22em,80vw);aspect-ratio:1;margin:0 auto 1.5em;border-radius:.7em;overflow:hidden;background:rgba(255,255,255,.08);box-shadow:0 1em 3em rgba(0,0,0,.35);}' +
            '.qobuz-audio-cover img{width:100%;height:100%;object-fit:cover;}' +
            '.qobuz-audio-title{font-size:1.55em;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.qobuz-audio-artist{opacity:.65;margin-top:.4em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.qobuz-audio-album{opacity:.45;margin-top:.25em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
            '.qobuz-audio audio{width:100%;margin:1.4em 0;}' +
            '.qobuz-audio-controls{display:flex;justify-content:center;gap:.8em;}' +
            '.qobuz-audio-btn{padding:.8em 1.2em;border-radius:.5em;background:rgba(255,255,255,.12);min-width:5em;text-align:center;}' +
            '.qobuz-audio-btn.focus,.qobuz-audio-btn:focus{background:rgba(255,255,255,.22);}' +
            '.qobuz-audio-status{margin-top:1em;opacity:.55;min-height:1.2em;}' +
        '</style>').appendTo('head');
    }

    function controller(items, onBack) {
        // Lampa.Controller.collectionSet expects a DOM element or jQuery object.
        // Do not pass an array containing jQuery objects (that makes html[0] a
        // jQuery object and causes "querySelectorAll is not a function").
        if (Array.isArray(items)) {
            items = $(items.map(function (item) {
                return item && item.jquery ? item[0] : item;
            }));
        }

        Lampa.Controller.add('qobuz_content', {
            toggle: function () {
                Lampa.Controller.collectionSet(items);
                Lampa.Controller.collectionFocus(false, items);
            },
            up: function () {
                Lampa.Controller.collectionUp();
            },
            down: function () {
                Lampa.Controller.collectionDown();
            },
            left: function () {
                Lampa.Controller.collectionLeft();
            },
            right: function () {
                Lampa.Controller.collectionRight();
            },
            ok: function () {
                Lampa.Controller.collectionEnter();
            },
            back: function () {
                onBack();
            }
        });

        Lampa.Controller.toggle('qobuz_content');
    }

    function Component() {
        var self = this;
        var html;
        var items;
        var scroll;

        this.create = function (object) {
            self.activity = object.activity;
            html = $('<div class="qobuz-page"></div>');

            var search = $('<div class="qobuz-search">' +
                '<input class="qobuz-input" placeholder="Поиск Qobuz...">' +
                '<div class="qobuz-button selector">Найти</div>' +
                '</div>');

            var body = $('<div></div>');
            var input = search.find('input');
            var button = search.find('.qobuz-button');

            html.append(search, body);

            button.on('hover:enter', function () {
                self.find(input.val(), body);
            });

            input.on('keydown', function (e) {
                if (e.keyCode === 13) self.find(input.val(), body);
            });

            body.html(
                '<div class="qobuz-title">Qobuz</div>' +
                '<div class="qobuz-message">Введите запрос и нажмите «Найти».</div>' +
                '<div style="text-align:center;margin-top:1em">' +
                '<div class="qobuz-button selector qobuz-settings">Настройки Qobuz</div>' +
                '</div>'
            );

            body.find('.qobuz-settings').on('hover:enter', function () {
                self.settings();
            });

            setTimeout(function () {
                try { input.focus(); } catch (e) {}
            }, 100);

            return this.render();
        };

        this.render = function () {
            return html;
        };

        this.settings = function () {
            var page = $('.qobuz-page');
            var old = page.find('.qobuz-settings-panel');

            if (old.length) {
                old.remove();
                return;
            }

            var s = settings();

            var panel = $(
                '<div class="qobuz-settings-panel" style="margin-top:1.5em;padding:1.5em;border-radius:.6em;background:rgba(255,255,255,.07)">' +
                    '<div class="qobuz-title" style="font-size:1.4em">Настройки Qobuz</div>' +
                    '<div style="opacity:.7;margin:.5em 0">App ID</div>' +
                    '<input class="qobuz-input qobuz-appid" value="' + esc(s.appId || '798273057') + '">' +
                    '<div style="opacity:.7;margin:1em 0 .5em">User Auth Token</div>' +
                    '<input class="qobuz-input qobuz-token" value="' + esc(s.userAuthToken || '') + '" placeholder="User Auth Token">' +
                    '<div style="opacity:.6;margin:1em 0">Токен хранится только в локальном хранилище Lampa.</div>' +
                    '<div class="qobuz-button selector qobuz-save-settings" style="margin-top:1em;text-align:center">Сохранить</div>' +
                '</div>'
            );

            page.append(panel);

            panel.find('.qobuz-save-settings').on('hover:enter click', function () {
                var appid = panel.find('.qobuz-appid').val() || '798273057';
                var token = panel.find('.qobuz-token').val() || '';

                Lampa.Storage.set(STORAGE, {
                    apiBase: 'https://www.qobuz.com/api.json/0.2',
                    appId: appid,
                    userAuthToken: token
                });

                Lampa.Noty.show('Qobuz: настройки сохранены');
                panel.remove();

                try {
                    Lampa.Controller.toggle('qobuz_content');
                } catch (e) {}
            });

            setTimeout(function () {
                try {
                    Lampa.Controller.collectionFocus(false, panel.find('.qobuz-save-settings'));
                } catch (e) {}
            }, 50);
        };


        this.find = function (query, body) {
            query = String(query || '').trim();
            if (!query) return;

            body.html('<div class="qobuz-message">Поиск…</div>');

            if (!settings().userAuthToken) {
                body.html('<div class="qobuz-message"><b>Нет User Auth Token</b><br><br>Откройте «Настройки Qobuz» и сохраните токен.</div>');
                return;
            }

            searchQobuz(query, function (data) {
                body.empty();

                var groups = [
                    ['albums', 'Альбомы'],
                    ['artists', 'Исполнители'],
                    ['tracks', 'Треки']
                ];

                var any = false;

                groups.forEach(function (group) {
                    var block = data && data[group[0]];
                    var list = block && (block.items || block);

                    if (!Array.isArray(list) || !list.length) return;

                    any = true;
                    body.append('<div class="qobuz-title">' + group[1] + '</div>');

                    var grid = $('<div class="qobuz-grid"></div>');
                    items = [];

                    list.forEach(function (item) {
                        var card = $('<div class="qobuz-card selector">' +
                            '<div class="qobuz-cover">' +
                            (imageOf(item) ? '<img src="' + esc(imageOf(item)) + '" onerror="this.style.display=\'none\'">' : '') +
                            '</div>' +
                            '<div class="qobuz-name">' + esc(item.title || item.name || '') + '</div>' +
                            '<div class="qobuz-sub">' +
                            esc(item.artist && item.artist.name || '') +
                            '</div></div>');

                        card.on('hover:enter', function () {
                            if (group[0] === 'albums') self.album(item);
                            else if (group[0] === 'artists') self.artist(item);
                            else self.play(item);
                        });

                        grid.append(card);
                        items.push(card);
                    });

                    body.append(grid);
                });

                if (!any) body.html('<div class="qobuz-message">Ничего не найдено.</div>');

                var all = body.find('.selector');
                if (all.length) controller(all, function () {
                    Lampa.Activity.backward();
                });
            }, function (message) {
                body.html(
                    '<div class="qobuz-message">' +
                    '<b>Qobuz: ' + esc(message || 'ошибка запроса') + '</b><br><br>' +
                    'Проверьте App ID и User Auth Token в настройках.' +
                    '</div>'
                );
            });
        };

        this.album = function (item) {
            var body = $('.qobuz-page').children().last();
            body.html('<div class="qobuz-message">Загрузка альбома…</div>');

            /*
             * Qobuz changed album/get in 2026:
             *   extra=tracks -> HTTP 400
             *   extra=track_ids -> returns track_ids
             *   album/get without extra -> album metadata without tracks
             *
             * Therefore we first get the album + track_ids and then resolve
             * each track through track/get.
             */
            request('album/get', {
                album_id: item.id,
                offset: 0,
                limit: 500,
                extra: 'track_ids'
            }, function (data) {
                var album = data && (data.album || data);

                if (!album || (!album.id && !album.title)) {
                    body.html('<div class="qobuz-message">Qobuz вернул пустые данные альбома.</div>');
                    return;
                }

                body.empty();

                var cover = imageOf(album) || imageOf(item);
                var artistName = album.artist && (album.artist.name || album.artist.title) ||
                    album.artist_name || item.artist && item.artist.name || '';

                var head = $('<div class="qobuz-head">' +
                    (cover ? '<img src="' + esc(cover) + '" onerror="this.style.display=\'none\'">' : '') +
                    '<div><div class="qobuz-title">' + esc(album.title || item.title || '') + '</div>' +
                    '<div>' + esc(artistName) + '</div></div>' +
                    '</div>');

                body.append(head);

                var ids = album.track_ids || album.trackIds || [];

                /* Compatibility with older API responses which still contain tracks. */
                var tracks = [];
                if (album.tracks) {
                    tracks = Array.isArray(album.tracks) ? album.tracks : (album.tracks.items || []);
                }
                if (!tracks.length && album.track_list) tracks = album.track_list;
                if (!tracks.length && album.items) tracks = album.items;

                function renderTracks(trackList) {
                    body.find('.qobuz-loading-tracks').remove();

                    var list = $('<div></div>');
                    var selectors = [];

                    trackList.forEach(function (track, i) {
                        var row = $('<div class="qobuz-row selector">' +
                            '<div class="qobuz-num">' + (i + 1) + '</div>' +
                            '<div class="qobuz-track">' + esc(track.title || '') + '</div>' +
                            '<div class="qobuz-time">' + duration(track.duration) + '</div>' +
                            '</div>');

                        row.on('hover:enter click', function (e) {
                            if (e && e.type === 'click') e.preventDefault();
                            var selected = $.extend({}, track, { album: album });
                            // Keep the complete album queue on every track.  This lets
                            // the player move to the next/previous Qobuz track.
                            selected.__qobuz_album_tracks = trackList.slice();
                            self.play(selected);
                        });

                        list.append(row);
                        selectors.push(row[0]);
                    });

                    body.append(list);

                    if (!selectors.length) {
                        body.append('<div class="qobuz-message">В альбоме не найден список треков.</div>');
                        return;
                    }

                    controller($(selectors), function () {
                        Lampa.Activity.backward();
                    });
                }

                if (tracks.length) {
                    renderTracks(tracks);
                    return;
                }

                if (!Array.isArray(ids) || !ids.length) {
                    body.append('<div class="qobuz-message">Qobuz не вернул track_ids для этого альбома.</div>');
                    return;
                }

                var loading = $('<div class="qobuz-message qobuz-loading-tracks">Загрузка треков… 0/' + ids.length + '</div>');
                body.append(loading);

                var resolved = [];
                var pos = 0;
                var stopped = false;

                function next() {
                    if (stopped) return;

                    if (pos >= ids.length) {
                        if (!resolved.length) {
                            loading.text('Не удалось получить треки альбома.');
                            return;
                        }
                        renderTracks(resolved);
                        return;
                    }

                    var trackId = ids[pos];
                    var current = pos;

                    request('track/get', { track_id: trackId }, function (trackData) {
                        var track = trackData && (trackData.track || trackData);
                        if (track && (track.id || track.title)) {
                            resolved.push(track);
                        }

                        pos++;
                        loading.text('Загрузка треков… ' + pos + '/' + ids.length);
                        next();
                    }, function () {
                        /* One unavailable track must not break the whole album. */
                        pos++;
                        loading.text('Загрузка треков… ' + pos + '/' + ids.length);
                        next();
                    });
                }

                next();
            }, function (message) {
                body.html(
                    '<div class="qobuz-message"><b>Ошибка загрузки альбома</b><br><br>' +
                    esc(message || 'Неизвестная ошибка Qobuz') +
                    '</div>'
                );
            });
        };

        this.artist = function (item) {
            var body = $('.qobuz-page').children().last();
            body.html('<div class="qobuz-message">Загрузка исполнителя…</div>');

            request('artist/get', { artist_id: item.id }, function (artist) {
                body.empty();
                body.append('<div class="qobuz-title">' + esc(artist.name || item.name) + '</div>');

                var grid = $('<div class="qobuz-grid"></div>');
                var selectors = [];

                var albums = artist.albums && (artist.albums.items || artist.albums) || [];

                albums.forEach(function (album) {
                    var card = $('<div class="qobuz-card selector">' +
                        '<div class="qobuz-cover">' +
                        (imageOf(album) ? '<img src="' + esc(imageOf(album)) + '" onerror="this.style.display=\'none\'">' : '') +
                        '</div><div class="qobuz-name">' + esc(album.title || '') + '</div></div>');

                    card.on('hover:enter', function () {
                        self.album(album);
                    });

                    grid.append(card);
                    selectors.push(card);
                });

                body.append(grid);
                controller($(selectors), function () {
                    Lampa.Activity.backward();
                });
            });
        };

        this.play = function (track) {
            var s = settings();

            if (!s.appId || !s.userAuthToken) {
                Lampa.Noty.show('Qobuz: укажите User Auth Token в настройках');
                return;
            }

            var formats = [27, 7, 6, 5];
            var tracks = Array.isArray(track.__qobuz_album_tracks) && track.__qobuz_album_tracks.length
                ? track.__qobuz_album_tracks
                : [track];
            var album = track.album || {};
            var cover = imageOf(album) || imageOf(track);
            var playlist = [];
            var currentIndex = 0;
            var busy = false;

            function makeElement(t, url, formatId) {
                var thumb = cover || imageOf(t.album || t);
                return {
                    url: url,
                    title: t.title || '',
                    artist: t.performer && (t.performer.name || t.performer.title) ||
                        t.artist && (t.artist.name || t.artist.title) || '',
                    album: album.title || t.album && t.album.title || '',
                    quality: formatId,
                    // Lampa's player implementations use thumbnail for the artwork.
                    // Keep the common aliases too for older/newer player builds.
                    thumbnail: thumb,
                    poster: thumb,
                    img: thumb,
                    picture: thumb
                };
            }

            function findCurrentIndex() {
                for (var i = 0; i < tracks.length; i++) {
                    if (String(tracks[i].id) === String(track.id)) return i;
                }
                return 0;
            }

            // If this album was already resolved, use the cached URLs immediately.
            if (track.__qobuz_resolved_urls) {
                playlist = track.__qobuz_resolved_urls;
                currentIndex = findCurrentIndex();
                var cachedCurrent = playlist[currentIndex] || playlist[0];
                if (cachedCurrent) {
                    cachedCurrent.playlist = playlist;
                    openAudioPlayer(playlist, currentIndex);
                }
                return;
            }

            function showLoading(text) {
                try { Lampa.Loading.start(); } catch (e) {}
                if (text) Lampa.Noty.show(text);
            }

            function stopLoading() {
                try { Lampa.Loading.stop(); } catch (e) {}
            }

            // Resolve every track in the album once.  Lampa's playlist needs real
            // playable URLs if the user wants automatic next/previous navigation.
            function resolveTrack(t, done) {
                var attempt = 0;

                function nextFormat() {
                    if (attempt >= formats.length) {
                        done(null);
                        return;
                    }

                    var formatId = formats[attempt++];
                    var secrets = QOBUZ_SECRETS.slice();
                    var secretIndex = 0;

                    function requestUrl() {
                        if (secretIndex >= secrets.length) {
                            nextFormat();
                            return;
                        }

                        var secret = secrets[secretIndex++];
                        request('track/getFileUrl', {
                            track_id: t.id,
                            format_id: formatId,
                            intent: 'stream',
                            __qobuz_signed: true,
                            __qobuz_secret: secret
                        }, function (data) {
                            if (data && data.url) {
                                done(makeElement(t, data.url, formatId));
                            } else {
                                requestUrl();
                            }
                        }, function () {
                            requestUrl();
                        });
                    }

                    requestUrl();
                }

                nextFormat();
            }

            if (busy) return;
            busy = true;

            var total = tracks.length;
            var doneCount = 0;
            var failedCount = 0;

            showLoading(total > 1 ? 'Qobuz: подготовка плейлиста 0/' + total : 'Qobuz: запуск…');

            // Sequential resolution is slower but much more reliable on TV/mobile
            // builds and avoids flooding Qobuz with simultaneous signed requests.
            function resolveNext(index) {
                if (index >= total) {
                    busy = false;
                    stopLoading();

                    if (!playlist.length) {
                        Lampa.Noty.show('Qobuz: не удалось получить поток для трека');
                        return;
                    }

                    currentIndex = findCurrentIndex();
                    // If an unavailable earlier track was skipped, find the exact
                    // selected URL by track id/title.
                    for (var ci = 0; ci < playlist.length; ci++) {
                        if (String(playlist[ci].__qobuz_track_id) === String(track.id)) {
                            currentIndex = ci;
                            break;
                        }
                    }

                    // Store the resolved queue on all track objects for subsequent
                    // clicks without another round of signed API requests.
                    tracks.forEach(function (t) {
                        t.__qobuz_resolved_urls = playlist;
                    });
                    track.__qobuz_resolved_urls = playlist;

                    var current = playlist[currentIndex] || playlist[0];
                    current.playlist = playlist;

                    openAudioPlayer(playlist, currentIndex);
                    return;
                }

                var t = tracks[index];
                resolveTrack(t, function (element) {
                    doneCount++;

                    if (element) {
                        element.__qobuz_track_id = t.id;
                        playlist.push(element);
                    } else {
                        failedCount++;
                    }

                    try {
                        Lampa.Noty.show('Qobuz: подготовка ' + doneCount + '/' + total);
                    } catch (e) {}

                    resolveNext(index + 1);
                });
            }

            resolveNext(0);
        };

        this.start = function () {
            try {
                Lampa.Controller.toggle('qobuz_content');
            } catch (e) {}
        };

        this.pause = function () {};
        this.stop = function () {};

        this.destroy = function () {
            if (scroll && scroll.destroy) scroll.destroy();
            if (items) items = null;
            if (html) html.remove();

            try { Lampa.Controller.remove('qobuz_content'); } catch (e) {}
        };
    }

    /*
     * Qobuz tracks are audio streams. Lampa.Player is primarily the native
     * video-player integration and some builds expose only video external
     * players.  Therefore v0.4.7 uses a small native HTML5 audio component
     * inside Lampa. It keeps the artwork visible, supports previous/next and
     * automatically advances through the Qobuz album queue.
     */
    var AUDIO_STATE = null;
    var AUDIO_INSTANCE = null;
    var AUDIO_LOAD_SEQ = 0;

    function stopExistingAudio() {
        AUDIO_LOAD_SEQ++;
        if (AUDIO_INSTANCE && AUDIO_INSTANCE !== null) {
            try { AUDIO_INSTANCE.pause(); } catch (e) {}
            try { AUDIO_INSTANCE.removeAttribute('src'); AUDIO_INSTANCE.load(); } catch (e) {}
        }
        AUDIO_INSTANCE = null;
    }

    function openAudioPlayer(playlist, index) {
        stopExistingAudio();
        AUDIO_STATE = { playlist: playlist || [], index: index || 0 };
        Lampa.Activity.push({
            title: (playlist && playlist[index] && playlist[index].title) || 'Qobuz',
            url: '',
            component: 'qobuz_audio_player',
            page: 1
        });
    }

    function AudioPlayerComponent() {
        var self = this;
        var html;
        var audio;
        var title;
        var artist;
        var album;
        var cover;
        var status;
        var prev;
        var next;
        var download;
        var current = 0;
        var state;

        this.create = function (object) {
            state = AUDIO_STATE || { playlist: [], index: 0 };
            current = Math.max(0, Math.min(state.index || 0, state.playlist.length - 1));

            html = $('<div class="qobuz-audio">' +
                '<div class="qobuz-audio-box">' +
                    '<div class="qobuz-audio-cover"><img class="qobuz-audio-img"></div>' +
                    '<div class="qobuz-audio-title"></div>' +
                    '<div class="qobuz-audio-artist"></div>' +
                    '<div class="qobuz-audio-album"></div>' +
                    '<audio class="qobuz-audio-element" controls preload="auto"></audio>' +
                    '<div class="qobuz-audio-controls">' +
                        '<div class="qobuz-audio-btn selector qobuz-prev">⏮ Предыдущий</div>' +
                        '<div class="qobuz-audio-btn selector qobuz-next">Следующий ⏭</div>' +
                        '<div class="qobuz-audio-btn selector qobuz-download">⬇ Скачать</div>' +
                    '</div>' +
                    '<div class="qobuz-audio-status"></div>' +
                '</div>' +
            '</div>');

            audio = html.find('.qobuz-audio-element')[0];
            stopExistingAudio();
            AUDIO_INSTANCE = audio;
            title = html.find('.qobuz-audio-title');
            artist = html.find('.qobuz-audio-artist');
            album = html.find('.qobuz-audio-album');
            cover = html.find('.qobuz-audio-img');
            status = html.find('.qobuz-audio-status');
            prev = html.find('.qobuz-prev');
            next = html.find('.qobuz-next');
            download = html.find('.qobuz-download');

            prev.on('hover:enter click', function (e) { if (e) e.preventDefault(); self.change(-1); });
            next.on('hover:enter click', function (e) { if (e) e.preventDefault(); self.change(1); });
            download.on('hover:enter click', function (e) { if (e) e.preventDefault(); self.downloadCurrent(); });

            $(audio).on('ended', function () { self.change(1, true); });
            $(audio).on('play', function () { status.text(''); });
            $(audio).on('error', function () { status.text('Ошибка воспроизведения аудио'); });

            this.load(current, true);
            return this.render();
        };

        this.render = function () { return html; };

        this.load = function (index, autoplay) {
            if (!state || !state.playlist.length) return;
            current = Math.max(0, Math.min(index, state.playlist.length - 1));
            var item = state.playlist[current] || {};
            var art = item.thumbnail || item.poster || item.img || item.picture || '';

            title.text(item.title || '');
            artist.text(item.artist || '');
            album.text(item.album || '');
            if (art) {
                cover.attr('src', art).show();
                cover.off('error').on('error', function () { $(this).hide(); });
            } else cover.hide();

            status.text('Трек ' + (current + 1) + ' из ' + state.playlist.length);
            // Stop the previous source before replacing it. The load sequence
            // also prevents a delayed play() from an older track from firing.
            AUDIO_LOAD_SEQ++;
            var loadSeq = AUDIO_LOAD_SEQ;
            try { audio.pause(); } catch (e) {}
            audio.src = item.url || '';
            audio.load();

            if (autoplay) {
                setTimeout(function () {
                    if (loadSeq !== AUDIO_LOAD_SEQ || AUDIO_INSTANCE !== audio) return;
                    var p = audio.play();
                    if (p && p.catch) p.catch(function () {
                        status.text('Нажмите ▶ на аудиоплеере');
                    });
                }, 120);
            }

            try { Lampa.Controller.toggle('qobuz_audio_content'); } catch (e) {}
        };

        this.change = function (delta, auto) {
            if (!state || !state.playlist.length) return;
            var nextIndex = current + delta;
            if (nextIndex < 0) nextIndex = state.playlist.length - 1;
            if (nextIndex >= state.playlist.length) nextIndex = 0;
            this.load(nextIndex, true);
        };

        this.downloadCurrent = function () {
            if (!state || !state.playlist.length) return;
            var item = state.playlist[current] || {};
            var url = item.url || '';
            if (!url) {
                Lampa.Noty.show('Qobuz: URL трека ещё не готов');
                return;
            }

            var safe = function (v) {
                return String(v || 'Qobuz').replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, ' ').trim();
            };
            var filename = safe(item.artist ? item.artist + ' - ' + item.title : item.title) || 'qobuz-track';
            filename += '.flac';

            // Use the WebView download mechanism when available. The signed Qobuz
            // URL is time-limited, so it must be handed off immediately.
            try {
                var a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.target = '_blank';
                a.rel = 'noopener';
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                setTimeout(function () { try { document.body.removeChild(a); } catch (e) {} }, 1000);
                Lampa.Noty.show('Qobuz: загрузка ' + filename);
            } catch (e) {
                try { window.open(url, '_blank'); } catch (e2) {}
                Lampa.Noty.show('Qobuz: не удалось запустить загрузку');
            }
        };

        this.start = function () {
            try { Lampa.Controller.toggle('qobuz_audio_content'); } catch (e) {}
        };
        this.pause = function () { try { AUDIO_LOAD_SEQ++; audio.pause(); } catch (e) {} };
        this.stop = function () { try { AUDIO_LOAD_SEQ++; audio.pause(); audio.removeAttribute('src'); audio.load(); } catch (e) {} };
        this.back = function () { try { AUDIO_LOAD_SEQ++; audio.pause(); audio.removeAttribute('src'); audio.load(); } catch (e) {}; if (AUDIO_INSTANCE === audio) AUDIO_INSTANCE = null; Lampa.Activity.backward(); };

        this.destroy = function () {
            if (AUDIO_INSTANCE === audio) {
                AUDIO_LOAD_SEQ++;
                AUDIO_INSTANCE = null;
            }
            try { audio.pause(); } catch (e) {}
            try { Lampa.Controller.remove('qobuz_audio_content'); } catch (e) {}
            if (html) html.remove();
        };

        setTimeout(function () {
            if (!html) return;
            Lampa.Controller.add('qobuz_audio_content', {
                toggle: function () {
                    Lampa.Controller.collectionSet(html.find('.selector'));
                    Lampa.Controller.collectionFocus(false, html.find('.selector'));
                },
                left: function () { Lampa.Controller.collectionLeft(); },
                right: function () { Lampa.Controller.collectionRight(); },
                up: function () { Lampa.Controller.collectionUp(); },
                down: function () { Lampa.Controller.collectionDown(); },
                ok: function () { Lampa.Controller.collectionEnter(); },
                back: function () { self.back(); }
            });
            Lampa.Controller.toggle('qobuz_audio_content');
        }, 50);
    }

    function menu() {
        var icon = '<svg width="24" height="24" viewBox="0 0 24 24">' +
            '<path fill="currentColor" d="M12 3v10.2a3.5 3.5 0 1 0 2 3.15V8h5V3h-7z"/></svg>';

        if (Lampa.Menu && Lampa.Menu.addButton) {
            var b = Lampa.Menu.addButton(icon, plugin.name, function () {
                Lampa.Activity.push({
                    title: plugin.name,
                    url: '',
                    component: plugin.component,
                    page: 1
                });
            });

            if (b && b.addClass) b.addClass('qobuz-menu-button');
            return;
        }

        var item = $('<li class="menu__item selector">' +
            '<div class="menu__ico">' + icon + '</div>' +
            '<div class="menu__text">' + plugin.name + '</div></li>');

        item.on('hover:enter', function () {
            Lampa.Activity.push({
                title: plugin.name,
                url: '',
                component: plugin.component,
                page: 1
            });
        });

        $('.menu .menu__list').eq(0).append(item);
    }

    function start() {
        if (window['plugin_' + plugin.component + '_ready']) return;
        window['plugin_' + plugin.component + '_ready'] = true;

        css();

        Lampa.Component.add(plugin.component, Component);
        Lampa.Component.add('qobuz_audio_player', AudioPlayerComponent);
        menu();

        console.log('[Qobuz Lampa] ' + plugin.version + ' loaded');
    }

    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') start();
    });
})();
