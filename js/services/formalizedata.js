/*
	Created by Ryan Quinn
	Source at www.github.com/mazondo
*/

(function($) {
	/*
		formalizeFormats is where we keep all of the registered formats
		Only number is included for now.
	*/
	var formalizeFormats = {
		number : function(value) {
			if (isNaN(value)) {
				throw "Expected a number!";
			} else {
				value = parseFloat(value);
			}
			return value;
		}
	};

	/*
		This is where we'll let you define your own formats
		Register them with:
			$.formalizeFormat("custom", function(value) {return value;} );

		Then you can:
			<input name="whatever" data-format="custom"></input>

		And we'll apply your transformation to the input
	*/
	$.formalizeFormat = function(name, operation) {
		formalizeFormats[name] = operation;
	}

	$.fn.formalizeData = function(options) {
		var data = {},
			defaults = {attribute: "name"},
			options = $.extend({}, defaults, options);


		$(this).find(":input[" + options.attribute + "]").each(function(index, value) {

			/*
				Check for a radio button, if it is, make sure it is checked or move on
			*/
			if ($(this).attr("type") == "radio" && !$(this)[0].checked) {
				return;
			}

			var name = $(this).attr(options.attribute);

			var	elements = name.split("."),
				result = $.extend({}, data),
				dataBuilder,
				elementValue,
				format;

			/*
				Setup the value by checking if the user specified a data type
				Currently only supports numbers
			*/

			elementValue = $(this).val();
			format = $(this).data("formalize");
			if (format && formalizeFormats[format] && typeof(formalizeFormats[format]) == "function") {
				elementValue = formalizeFormats[format](elementValue);
			}

			/*
				Traverse through the elements in the name trying to get to the final result
				save the final result for processing later
			*/

			$.each(elements, function(index, val) {
				result = result[val] || false;
				if (!result) {
					return true;
				}
			});


			/*
				now that we have the result, we need to tell it what to be
				we'll check to see if it's defined, and if not just set it to the value
				If it is, we will decide if it's an object or an array and handle it accordingly
			*/
			if (!result) {
				/*
					When nothing exists in the end location, we just save the value
				*/
				result = elementValue;

			} else {
				/*
					When something does exist at the end location, we turn it into an array and add this value to it
				*/
				if ($.isArray(result)) {
					result.push(elementValue);
				} else {
					result = [result]
					result.push(elementValue);
				}

			}


			/*
				Now we have a result saved, and we need to add it where it belongs in the data object
				We'll need to build out the data structure as we go if any parent elements are not yet defined

				dataBuidlder is used to store a reference to the current location in the data object
			*/

			dataBuilder = data;
			$.each(elements, function(index, val) {
				if ( (index + 1) == elements.length) {
					//we're at the end location, so let's save the result here
					//it's safe to overwrite a previous value because we've accounted for it above
					dataBuilder[val] = result;
				} else {
					//not at the end, so let's make sure the item exists
					if (!dataBuilder[val]) {
						//doesn't exist, let's create it
						dataBuilder[val] = {};
					}
					//now progress the dataBuilder up a level
					dataBuilder = dataBuilder[val];
				}
			});


		});
		
		return data;
	};

})(jQuery);