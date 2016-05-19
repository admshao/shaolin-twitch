/* jshint -W106 */
(function() {
    'use strict';

    var disabledCover = document.getElementById('cover');

    var layoutState = nodecg.Replicant('layoutState');
    layoutState.on('change', function(oldVal, newVal) {
        disabledCover.reason = newVal.page;

        if (newVal.page === 'open') {
            disabledCover.reason = null;

            /* When the dashboard first loads, the layout might already be open and have all ads preloaded.
             * Therefore, on first load we have to ask the layout what the status of all the ads is.
             * This message will trigger the layout to send `adLoadProgress` or `adLoadFinished` events
             * for all ads. */
            setTimeout(function() {
                nodecg.sendMessage('getLoadedAds');
            }, 100);
        }

        else {
            disabledCover.reason = newVal.page;

            if (newVal.page === 'closed') {
                var adItems = Array.prototype.slice.call(document.querySelectorAll('ad-item'));
                adItems.forEach(function(adItem) {
                    adItem.percentLoaded = 0;
                    adItem.loaded = false;
                });
            }
        }
    });

    /* ----- */

    var playImageButton = document.getElementById('play-image');
    var playVideoButton = document.getElementById('play-video');

    window.checkVideoPlayButton = function () {
        if (!window.playCooldown
            && window.adListSelectedAd
            && window.adListSelectedAd.type === 'video') {
            playVideoButton.removeAttribute('disabled');
        } else {
            playVideoButton.setAttribute('disabled', 'true');
        }
    };

    playImageButton.addEventListener('click', playButtonClick);
    playVideoButton.addEventListener('click', playButtonClick);

    function playButtonClick() {
        // window.adListSelectedAd is set by elements/ad-list.html
        nodecg.sendMessage('playAd', window.adListSelectedAd);

        playImageButton.querySelector('span').innerText = 'Starting playback...';
        playVideoButton.querySelector('span').innerText = 'Starting playback...';
        playImageButton.setAttribute('disabled', 'true');
        playVideoButton.setAttribute('disabled', 'true');

        window.playCooldown = setTimeout(function() {
            window.playCooldown = null;
            playImageButton.removeAttribute('disabled');
            playImageButton.querySelector('span').innerText = 'Play Selected Ad';
            playVideoButton.querySelector('span').innerText = 'Play Selected Ad';
            window.checkVideoPlayButton();
        }, 1000);
    }

    var stopButton = document.getElementById('stop');
    stopButton.addEventListener('click', function() {
        nodecg.sendMessage('stopAd');
    });

    var ftbButton = document.getElementById('ftb');
    ftbButton.addEventListener('click', function() {
        ftb.value = !ftb.value;
    });

    var ftb = nodecg.Replicant('ftb');
    ftb.on('change', function(oldVal, newVal) {
        window.checkVideoPlayButton();
        if (newVal) {
            ftbButton.classList.add('nodecg-warning');
            playVideoButton.querySelector('span').innerText = 'Play Selected Ad';
        } else {
            ftbButton.classList.remove('nodecg-warning');
            playVideoButton.querySelector('span').innerText = 'FTB To Play Video';
        }
    });

    /* ----- */

    var imageList = document.getElementById('imageList');
    var videoList = document.getElementById('videoList');
    nodecg.Replicant('ads').on('change', function (oldVal, newVal) {
        imageList.ads = newVal.filter(function(ad) {
            return ad.type === 'image';
        });

        videoList.ads = newVal.filter(function(ad) {
            return ad.type === 'video';
        });
    });

    nodecg.listenFor('adLoadProgress', function(data) {
        var el = document.querySelector('ad-item[filename="' + data.filename + '"]');
        if (el) el.percentLoaded = data.percentLoaded;
    });

    nodecg.listenFor('adLoaded', function(filename) {
        var el = document.querySelector('ad-item[filename="' + filename + '"]');
        if (el) el.loaded = true;
    });

    /* ----- */

    var adState = nodecg.Replicant('adState');
    var status = document.getElementById('status');
    adState.on('change', function(oldVal, newVal) {
        switch (newVal) {
            case 'stopped':
                status.innerText = 'Not currently playing an ad.';
                status.style.fontWeight = 'normal';
                break;
            case 'playing':
                status.innerText = 'An ad is in progress.';
                status.style.fontWeight = 'bold';
                break;
            default:
                throw new Error('Unexpected adState: "' + newVal + '"');
        }
    });
})();
