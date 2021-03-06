var observer;
var domSelector = 'img:not([kemono-injected]), a:not([kemono-injected]), figure:not([kemono-injected]), div:not([kemono-injected])';

function createObserver () {
   return new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0 ) {
                mutation.addedNodes.forEach(function (node) {
                    if (node) {
                        replaceImages(domSelector, node);
                    }
                });
            }
        });

        observer.disconnect();
        runObserver();
    });
}


function runObserver () {
    // kemono
    chrome.runtime.sendMessage({msg: 'getDisabled'}, function(response) {
        if (!response.disabled) {
            replaceImages(domSelector);
            var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
            observer = createObserver();
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });
};
runObserver();

function createWrapperDiv(object, imageUrl) {
    var wrapperDiv = document.createElement('div');
    wrapperDiv.setAttribute('style', object.getAttribute('style'));
    // adjust width & height before wrap it
    if (object.style) {
        if (object.clientWidth > 2) {
            wrapperDiv.style.width = object.clientWidth + 'px';
        }
        wrapperDiv.style.maxWidth = '100%';
        if (object.clientHeight > 2) {
            wrapperDiv.style.height = object.clientHeight + 'px';
        } else {
            if (!object.style.height) {
                wrapperDiv.style.height = 'auto';
            }
        }
        if (object.outerHTML.match('width=') || object.width > 0) {
            wrapperDiv.style.width = object.width + 'px';
            wrapperDiv.style.height = 'auto';
        }
        if (object.outerHTML.match('height=') || object.height > 0) {
            wrapperDiv.style.height = object.height + 'px';
        }
    }
    wrapperDiv.style.backgroundImage = "url('" + imageUrl + "')";
    wrapperDiv.setAttribute('kemono-injected', '');
    wrapperDiv.classList.add('kemono-wrapper');
    return wrapperDiv;
}

function wrapDiv(el, wrapper) {
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
}

function replaceImages(selector, node) {
    var objects;
    if (node) {
        if (node.querySelectorAll) {
            objects = [ node, ...node.querySelectorAll(selector) ];
        } else {
            objects = [ node ];
        }
    } else {
        objects = document.querySelectorAll(selector);
    }
    var imagePrefix = 'https://pbs.twimg.com/media/';
    var imageSrcs = [
        'C46fOL7VcAAM4H-.jpg', 'C5cdRXyUoAEQ8HK.jpg', 'C7rkymbVwAAE11F.jpg', 'C7HmZy4VAAETPGR.jpg',
        'C7Hmew-UwAEOBox.jpg', 'C6ispvmVwAAKLvZ.jpg', 'C6issRcV0AIXjll.jpg', 'C5-jiooUsAAmOJy.jpg',
        'C5-jlo2UYAAIVcT.jpg', 'C5atYAoUwAAoEBz.jpg', 'C5atflpUYAADBbS.jpg', 'C5atg0BUoAA_zNu.jpg',
        'C42iwUAUoAAY8HV.jpg', 'C42iyZtUcAAof4R.jpg', 'C42i0tqUEAEOffq.jpg', 'C4nf2a-VcAMGy-3.jpg',
        'C3t7WvCVcAAsBoo.jpg', 'C3t7a5LVYAAl2Kd.jpg', 'C3KH9iQVMAIIgda.jpg', 'C2h5KX4UcAID-Fe.jpg',
        'C2h5WoJUcAA-qF_.jpg', 'C2h5XxQUQAALHkl.jpg', 'C7HmdfMV0AARKV5.jpg', 'C7HmfteVwAARQPd.jpg',
        'C6isrAgU8AMoyOI.jpg', 'C6istZoVsAAu6-b.jpg', 'C5-jhrYU4AIF92w.jpg', 'C5-jjhqVMAAKEmx.jpg',
        'C5atahqUoAAtgXX.jpg', 'C5W4dj2VYAE6Zmi.jpg', 'C42i2F9UYAA5O47.jpg', 'C4Sf2yrUkAAOKAh.jpg',
        'C4Sf2yuVYAAjLo1.jpg', 'C4Sf2yoUoAA0mgW.jpg', 'C4SgCzyVcAAdOXz.jpg', 'C3t7Y8EUkAAoQfW.jpg',
        'C3t7a5JUYAA9B7r.jpg', 'C3KH7vZUMAAXV13.jpg', 'C3KH9iRVcAAi6Bd.jpg', 'C3KH9iRVYAc-lh5.jpg',
        'C3Gjis2VYAEVgY_.jpg', 'C3Gjn9_UMAAdHEr.jpg', 'C3Gj6RJVYAAglcP.jpg', 'C3Gj841VMAA5D0c.jpg',
        'C2h5VHZUcAAHR6j.jpg', 'C2B3A6xUAAEKTb6.jpg', 'C2B3DkwUkAE9vnB.jpg', 'C2B3DkxVEAQhmwl.jpg',
        'C2B3HBZUkAAEF3B.jpg'
    ];
    for (var i = 0; i < objects.length; i++) {
        var imgSrc = imagePrefix + imageSrcs[Math.floor(Math.random()*imageSrcs.length)];
        var object = objects[i];

        if ('function' === typeof object.setAttribute) {
            object.setAttribute('kemono-injected', '');
        }

        if (object.src && 'IMG' === object.tagName) {
            var wrapElement = createWrapperDiv(object, imgSrc);
            wrapDiv(object, wrapElement);
            // and now image is wrapped, set width to the width of its wrapper and cleans its style
            object.setAttribute('style', '');
            object.style.width = wrapElement.style.width;
            object.style.height = wrapElement.style.height;
        } else if (object.style && undefined !== object.style.backgroundImage && '' !== object.style.backgroundImage) {
            if (object.classList.contains('kemono-wrapper')) {
                continue;
            } else {
                object.setAttribute('kemono-orig-bgimg', object.style.backgroundImage);
                object.setAttribute('kemono-orig-bgpos', object.style.backgrounPosition);
                object.setAttribute('kemono-bgimg', "url('" + imgSrc + "')");
                object.setAttribute('kemono-bgpos', 'center');
                object.onmouseover = function () {
                    this.style.backgroundImage = this.getAttribute('kemono-orig-bgimg');
                    this.style.backgroundImage = this.getAttribute('kemono-orig-bgpos');
                };
                object.onmouseout = function () {
                    this.style.backgroundImage = this.getAttribute('kemono-bgimg');
                    this.style.backgroundImage = this.getAttribute('kemono-bgpos');
                }
                object.style.backgroundImage = object.getAttribute('kemono-bgimg');
                object.style.backgroundImage = object.getAttribute('kemono-bgpos');
            }
        }
    }
}