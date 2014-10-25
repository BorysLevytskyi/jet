angular.module("app")
    .controller("GeneratorCtrl", function($scope, jet, dataStore, stash){
        //console.log("Loaded isJson: %s",localStorage.getItem("isJson"));
        var configKey = 'config';
        var cfg = $scope.config = dataStore.getObject(configKey) || {
            template: localStorage.getItem("template") || "$item",
            data: localStorage.getItem("data") || "1\n2\n3",
            isJson:localStorage.getItem("isJson") !== null || false,
            joinWith: localStorage.getItem("joinWith") || "\\n",
            dataRowSeparator:"\\n",
            dataColumSeprator:"\\s"
        };

        $scope.stashTemplates = stash.getTemplates() || [];

        $scope.stashTemplate = function() {
            $scope.stashTemplates = stash.stashTemplate(cfg.template);
            cfg.template = "";
        };

        $scope.removeTemplateFromStash = function(index) {
            $scope.stashTemplates = stash.removeTemplate(index);
        };

        $scope.setTemplateFromStash = function(template, unstash) {
            cfg.template = template;
            if(unstash === true) {
                $scope.removeTemplateFromStash(template);
            }
        };

        $scope.$watch('config', function(newVal) {
            dataStore.setObject(configKey, newVal); // TODO: Incupsulate
        }, true);

        $scope.success = true;

        $scope.generate = function() {
            var out = document.getElementById("output");
            var output;

            try {
                output = jet.generateTemplate($scope.config);
                $scope.success = true;
            } catch (ex) {
                output = ex.stack;
                $scope.success = false;
            }

            //TODO: Replace by result parameter
            out.value = output;
            out.style.color = $scope.success ? "black" : "red";
        };

        $scope.spec = function(token) {
            var spec = jet.findSpec(token);
            return spec == null ? '' : spec.description;
        };

        $scope.isKnownSpec = function(spec) {
           return jet.findSpec(spec) !== null;
        };

        $scope.helpHtml = function() {
            return "<ul>" +
                        "<li><code>$item</code> - current item</li>" +
                        "<li><code>$first</code> - true if item is first in list</li>" +
                        "<li><code>$last</code> - true if item is last in list</li>" +
                        "<li><code>$global</code> - global object</li>" +
                    "</ul>";
        }

    });