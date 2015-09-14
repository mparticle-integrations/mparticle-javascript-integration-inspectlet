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
    name = 'Inspectlet',
    reportingService,
    id = null;

    function getIdentityTypeName(identityType) {
        return mParticle.IdentityType.getName(identityType);
    }

    function processEvent(event) {
        var reportEvent = false;

        if (isInitialized) {
            try {
                if (event.EventDataType == MessageType.PageEvent) {
                    if (event.EventCategory == window.mParticle.EventType.Transaction) {
                        logTransaction(event);

                        return 'Successfully sent to ' + name;
                    }
                    else if (event.EventDataType == window.mParticle.EventType.Navigation) {
                        __insp.push(["virtualPage"]);
                        return 'Successfully sent virtual page view to ' + name;
                    }

                    if (reportEvent && reportingService) {
                        reportingService(id, event);
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
        var attributeDict;

        if (isInitialized) {
            if (value) {
                attributeDict = {};
                attributeDict[key] = value;
                __insp.push(['tagSession', attributeDict]);
            }
            else {
                __insp.push(['tagSession', key]);
            }
        }
        else {
            return 'Can\'t call setUserAttribute on forwarder ' + name + ', not initialized';
        }
    }

    function setUserIdentity(id, type) {
        if (isInitialized) {
            setUserAttribute(getIdentityTypeName(type), id);
        }
        else {
            return 'Can\'t call setUserIdentity on forwarder ' + name + ', not initialized';
        }
    }

    function initForwarder(settings, service, moduleId) {
        forwarderSettings = settings;
        id = moduleId;
        reportingService = service;

        try {
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
                }
                else {
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