window.jet = (function(){
    var j = {};

    var shortExp = /(\${1,2}(item|index|global|first|last|odd|even)[\w_\.\(\)\[\]]*)/g,//TODO: Make autogenerated
        bracetExpr = /{{(((?!{{).)+)}}/g;
       // longExpRegex =/\$\(([^)]+)\)/g,
        //funcExpRegex = /<\$([^\$]+)\$>/g,
        //escapeRegex = /\\(.)/g,
       // commentRegex = /(\/\*[\w'\s\r\n\*]*\*\/)|(\/\/[\w\s\']*)|(<![\-\-\s\w>\/]*>)/g;

    j.tokens = [
       // { regex: commentRegex, type:"Comment"},
        { regex: bracetExpr, type: "Expression", getExpression: function(matches) {
            return matches[1];
        } },
       { regex:  shortExp, type: "Expression", getExpression: function(matches) {
           return matches[1]; }
       }
       // { regex:  funcExpRegex, type: "Expression" },
       // { regex:  escapeRegex, type: "Escape symbol" }
    ];

    j.generateTemplate = (function () {

        function generate(items, options) {
            var opts = options;
            opts.template = opts.template || "";
            opts.joinWith = opts.joinWith || "\n";

            var template = opts.template;

            var output = [];
            var global = {
                items:items,
                foo: function() {
                    return "this is foo";
                },
                translate: function(string, dictionary) {
                    if(dictionary.hasOwnProperty(string)) {
                        return dictionary[string];
                    }
                    return string;
                }
            };

            console.log('Data Items:', items)

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                output.push(generateItemRecord(item, i, items, template, global));
            }

            var result = output.join(opts.joinWith);
            return result; //.replace(/\$\$/g, '$');
        }

        function generateItemRecord(dataItem, index, allDataItems, template, global) { //TODO: Too many arguments

            var context = {
                $item: dataItem,
                $index: index,
                $first: index == 0,
                $odd: index % 2 == 1,
                $even: index % 2 == 0,
                $last: index == allDataItems.length - 1,
                $global:global
            };

            _.chain(jet.tokens).where(function(t) {
                return t.type.toLowerCase() == "expression";
            }).each(function(expr) {
                var processExpression = _.partial(replaceExpression.bind(context), expr);
                template = template.replace(expr.regex, processExpression)
            });

            return  template;
            //  .replace(commentRegex, "")
            //.replace(bracetExpr, replaceExpression.bind(context));
            //.replace(longExpRegex, replaceExpression.bind(context))
            // .replace(funcExpRegex, replaceFuncExpression.bind(context))
            //.replace(escapeRegex, "$1");
        }

        function replaceExpression(expr, match) {
            var escapeRegex = /^\${2}/; // TODO: Promote to global scope
            if(escapeRegex.test(match)) {
                return match.replace(escapeRegex, '$'); // Escape
            }

            var matches = Array.prototype.slice.call(arguments, 1), // Regex matched group
                value = _.isFunction(expr.getExpression) ? expr.getExpression(matches) : matches[0];

            var result = executeExpression(value, this);
            return result;
        }

        function replaceFuncExpression(match, expr) {

            var funcExpr = "(function(){" + expr + "})()";
            //console.log('execute func expr: %s', funcExpr);
            return executeExpression(funcExpr, this);
        }

        function executeExpression(expression, context) {

            var result = null;

            with(context){
                try {
                    console.log('Executing expression', expression, context);
                    result =  eval(expression);
                }
                catch (error){
                    console.error('Error while executing expression:', expression, error, context);

                    throw new Error('Error while executing expression:\n' + expression + "\n" + error);
                }
            }

            return result;
        }

        return generate;
    })();

    return j;
})();