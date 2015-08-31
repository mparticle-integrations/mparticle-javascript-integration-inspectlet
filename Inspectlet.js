(function (window) {
    var MessageType = {
        SessionStart: 1,
        SessionEnd: 2,
        PageView: 3,
        PageEvent: 4,
        CrashReport: 5,
        OptOut: 6
    },
    isInitialized = false,
    forwarderSettings,
    name = 'Inspectlet';

    function getIdentityTypeName(identityType) {
        switch (identityType) {
            case mParticle.IdentityType.CustomerId:
                return 'Customer ID';
            case mParticle.IdentityType.Facebook:
                return 'Facebook ID';
            case mParticle.IdentityType.Twitter:
                return 'Twitter ID';
            case mParticle.IdentityType.Google:
                return 'Google ID';
            case mParticle.IdentityType.Microsoft:
                return 'Microsoft ID';
            case mParticle.IdentityType.Yahoo:
                return 'Yahoo ID';
            case mParticle.IdentityType.Email:
                return 'Email';
            case mParticle.IdentityType.Alias:
                return 'Alias ID';
            case mParticle.IdentityType.FacebookCustomAudienceId:
                return 'Facebook App User ID';
            default:
                return 'Other ID';
        }
    }

    function processEvent(event) {
        if (isInitialized) {
            try {
                if (event.dt == MessageType.PageEvent) {
                    if (event.et == window.mParticle.EventType.Transaction) {
                        logTransaction(event);
                        return 'Successfully sent to ' + name;
                    } else if (event.dt == window.mParticle.EventType.Navigation) {
                        __insp.push(["virtualPage"]);
                        return 'Successfully sent virtual page view to ' + name;
                    }
                } 

                return 'Ignoring non-transaction event for ' + name;
            }
            catch (e) {
                return 'Failed to send to: ' + name + ' ' + e;
            }
        }

        return 'Can\'t send to forwarder ' + name + ', not initialized';
    }

    function logTransaction(data) {
        __insp.push(['tagSession', "purchase"]); 
    }

    function setUserAttribute(key, value) {
        if (isInitialized) {
            if (value) {
                var attributeDict = {};
                attributeDict[key] = value;
                __insp.push(['tagSession', attributeDict]);
            } else {
                __insp.push(['tagSession', key]);
            }
        } else {
            return 'Can\'t call setUserAttribute on forwarder ' + name + ', not initialized';
        }
    }

    function setUserIdentity(id, type) {
        if (isInitialized) {
            setUserAttribute(getIdentityTypeName(type), id);
        } else {
            return 'Can\'t call setUserIdentity on forwarder ' + name + ', not initialized';
        }
    }

    function initForwarder(settings) {
        try {
            forwarderSettings = settings;
            function addInspectlet() {
                function __ldinsp() {
                    var insp = document.createElement('script');
                    insp.type = 'text/javascript';
                    insp.async = true;
                    insp.id = "inspsync";
                    insp.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://cdn.inspectlet.com/inspectlet.js';
                    var head = document.getElementsByTagName('head')[0];
                    head.appendChild(insp);
                }
                if (window.attachEvent) {
                    window.attachEvent('onload', __ldinsp);
                } else {
                    window.addEventListener('load', __ldinsp, false);
                }
            }

            window.__insp = window.__insp || [];
            __insp.push(['wid', forwarderSettings.WId]);
            addInspectlet();

            isInitialized = true;

            return 'Successfully initialized: ' + name;
        }
        catch (e) {
            return 'Failed to initialize: ' + name;
        }
    }

    if (!window || !window.mParticle || !window.mParticle.addForwarder) {
        return;
    }

    window.mParticle.addForwarder({
        name: name,
        init: initForwarder,
        process: processEvent,
        setUserAttribute: setUserAttribute,
        setUserIdentity: setUserIdentity
    });

})(window);