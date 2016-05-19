/* global define, Power1, TweenLite, TimelineLite, createjs */
define([
    'debug',
    'preloader',
    'classes/stage'
],function(debug, preloader, Stage) {
    'use strict';

    var SLIDE_DURATION = 1.5;
    var FADE_DURATION = 0.5;
    var FADE_EASE = Power1.easeInOut;
    var IMAGE_AD_DURATION = 30;

    /* ----- */

    var adState = nodecg.Replicant('adState');

    function loadAd(ad) {
        debug.log('[advertisements] Loading %s', ad.filename);

        var preloadType = ad.type === 'video'
            ? createjs.AbstractLoader.VIDEO
            : createjs.AbstractLoader.IMAGE;

        preloader.loadFile({
            id: 'ad-' + ad.filename,
            src: ad.url,
            gdqType: 'ad',
            gdqFilename: ad.filename,
            type: preloadType
        });
    }

    nodecg.readReplicant('ads', function(value) {
        value.forEach(loadAd);
    });

    nodecg.listenFor('adRemoved', function(ad) {
        debug.log('[advertisements] Removing %s', ad.filename);
        preloader.remove('ad-' + ad.filename);
    });

    nodecg.listenFor('adChanged', function(ad) {
        debug.log('[advertisements] Reloading %s', ad.filename);
        preloader.remove('ad-' + ad.filename);
        loadAd(ad);
    });

    nodecg.listenFor('newAd', loadAd);

    preloader.on('fileprogress', function(e) {
        if (e.item.gdqType !== 'ad') return;
        nodecg.sendMessage('adLoadProgress', {
            filename: e.item.gdqFilename,
            percentLoaded: e.loaded*100
        });
    });

    preloader.on('fileload', function(e) {
        if (e.item.gdqType !== 'ad') return;
        nodecg.sendMessage('adLoaded', e.item.gdqFilename);
    });

    nodecg.listenFor('getLoadedAds', function() {
         preloader.getItems(false).forEach(function(item) {
             if (item.result && item.item.gdqType === 'ad') {
                 nodecg.sendMessage('adLoaded', item.item.gdqFilename);
             }
         });
    });

    /* ----- */

    var ftbCover = document.getElementById('ftbCover');
    var ftb = nodecg.Replicant('ftb');
    ftb.on('change', function(oldVal, newVal) {
        if (newVal) {
            TweenLite.to(ftbCover, FADE_DURATION, {
                opacity: 1,
                ease: FADE_EASE,
                onComplete: function() {
                    Stage.globalPause = true;
                }
            });
        } else {
            TweenLite.to(ftbCover, FADE_DURATION, {
                onStart: function() {
                    Stage.globalPause = false;
                },
                opacity: 0,
                ease: FADE_EASE
            });
        }
    });

    /* ----- */

    var container = document.getElementById('container');
    var imageContainer = document.getElementById('imageAdContainer');
    var currentImage, nextImage;
    var tl = new TimelineLite({autoRemoveChildren: true});

    nodecg.listenFor('stopAd', function() {
        adState.value = 'stopped';
        tl.clear();
        tl.to(imageContainer, FADE_DURATION, {
			opacity: 0,
            ease: FADE_EASE,
            onComplete: function() {
				removeAdImages();
				removeAdVideo();
			}
        });
    });

    // We assume that if we're hearing this message then the ad in question is fully preloaded.
    nodecg.listenFor('playAd', function(ad) {
        var result = preloader.getResult('ad-' + ad.filename);
        if (ad.type === 'image') {
            if (result) {
                showAdImage(result);
                nodecg.sendMessage('logAdPlay', ad);
            } else {
                throw new Error('Tried to play ad but ad was not preloaded:' + ad.filename);
            }
        } else if (ad.type === 'video') {
            if (result) {
                showAdVideo(result);
                nodecg.sendMessage('logAdPlay', ad);
            } else {
                throw new Error('Tried to play ad but ad was not preloaded:' + ad.filename);
            }
        } else {
            throw new Error('[advertisements] Unexpected ad type: "' + ad.type + '"');
        }
    });

    function showAdImage(img) {
        // If the new ad is the same as the old one, do nothing.
        if (currentImage === img) {
            debug.log('[advertisements] New img is identical to current image, aborting.');
            return;
        }

        // Clear any existing tweens. Advertisements ain't nothin' to fuck wit.
        tl.clear();
        tl.add('start');

        // If we already have a next image, ???
        if (nextImage) {
            throw new Error('[advertisements] We\'ve already got a next image queued up, you\'re screwed.');
        }

        // If there is an existing image being displayed, we need to crossfade to the new image.
        if (currentImage) {
            nextImage = img;
            nextImage.style.opacity = 0;
            imageContainer.appendChild(nextImage);

            tl.to(nextImage, FADE_DURATION, {
				onStart: function() {
                    imageContainer.removeChild(currentImage);
				},
                opacity: 1,
                ease: FADE_EASE,
                onComplete: function() {
                    currentImage = nextImage;
                    nextImage = null;
                }
            }, 'start');
        }

        // Else, just slide the imageContainer in.
        else {
            currentImage = img;
            imageContainer.appendChild(currentImage);

            tl.to(imageContainer, FADE_DURATION, {
                onStart: function() {
                    //currentImage.style.opacity = 1;
                    adState.value = 'playing';
                },
				opacity: 1,
                ease: FADE_EASE,
				onComplete: function() {
					removeAdVideo();
				}
            }, 'start');
        }

        // Slide out after FADE_DURATION seconds.
        tl.to(imageContainer, FADE_DURATION, {
            opacity: 0,
            ease: FADE_EASE,
            onComplete: function() {
                adState.value = 'stopped';
                removeAdImages();
            }
        }, 'start+=' + (IMAGE_AD_DURATION + FADE_DURATION));
    }

    function removeAdImages() {

        if (currentImage) {
            imageContainer.removeChild(currentImage);
            currentImage = null;
        }

        if (nextImage) {
            imageContainer.removeChild(nextImage);
            nextImage = null;
        }
		imageContainer.style.opacity = 0;
    }

    function showAdVideo(video) {
        video.removeEventListener('playing', playingListener);
        video.removeEventListener('ended', endedListener);

        removeAdVideo();
        removeAdImages();

        video.currentTime = 0;
        video.style.visibility = 'hidden';
        video.id = 'videoPlayer';
        video.classList.add('fullscreen');
        video.play();

        // The videos sometimes look at bit weird when they first start playing.
        // To polish things up a bit, we hide the video until the 'playing' event is fired.
        video.addEventListener('playing', playingListener);

        // When the video ends, remove it from the page.
        video.addEventListener('ended', endedListener);

        container.appendChild(video);
    }

    function removeAdVideo() {
        while (document.getElementById('videoPlayer')) {
            container.removeChild(document.getElementById('videoPlayer'));
        }
    }

    var playingListener = function() {
        this.style.visibility = 'visible';
        this.removeEventListener('playing', playingListener);
        adState.value = 'playing';
    };

    var endedListener = function() {
        removeAdVideo();
        this.removeEventListener('ended', endedListener);
        adState.value = 'stopped';
    };
});


