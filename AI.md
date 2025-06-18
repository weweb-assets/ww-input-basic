---
name: ww-input-basic
description: A versatile input field component supporting text, email, password, currency, and more types with customizable properties for multi-language text, placeholder color, precision, currency formatting, and features like read-only mode, required validation, and debounce functionality.
keywords:
  - input field
  - multi-language support
  - placeholder color
  - input type
  - display password
  - read-only input
  - required field
  - decimal precision
  - time precision
  - textarea resize
  - debounce input
  - currency input
  - currency formatting
---

#### ww-input-basic

Renders an input field as text input, textarea, or various types (email, password, number, date, time, color picker).

Properties:
- text: string|object - Text to display. Default: "". Multi-language: {en:"Hello",fr:"Bonjour"}
- placeholderColor: string|null - Placeholder text color. Default: null
- value: string|number - Initial value. Default: ""
- type: text|textarea|email|search|password|number|decimal|date|time|tel|color|currency - Input type. Default: "text"
- displayPassword: boolean - Show password in plain text. Default: false
- readonly: boolean - Read-only mode. Default: false
- required: boolean - Required field. Default: true
- precision: 0.1|0.01|0.001|0.0001|0.00001|0.000001|0.0000001|0.00000001 - Decimal precision. Default: "0.1"
- step: number - Number input step. Default: 1
- timePrecision: 3600|60|1|0.1 - Time input precision. Default: 1
- placeholder: string|number - Placeholder text. Default: {}
- rows: number - Textarea rows (1-25). Default: 4
- resize: boolean - Textarea resizable. Default: false
- min: number - Min value (0-100). Default: 0
- max: number - Max value (0-10000). Default: 10000
- minDate: string - Min date (yyyy-mm-dd). Default: ""
- maxDate: string - Max date (yyyy-mm-dd). Default: ""
- hideArrows: boolean - Hide number input arrows. Default: false
- debounce: boolean - Enable debounce. Default: false
- debounceDelay: string - Debounce delay (1-5000ms). Default: "500ms"
- autocomplete: boolean - Enable browser autocomplete. Default: false
- customValidation: boolean - Enable custom validation. Default: false
- validation: Formula - Custom validation formula. Requires customValidation to be true!
- currencyShowSymbol: boolean - Show currency symbol. Default: true
- currencySymbol: string - Currency symbol text. Default: "$"
- currencySymbolPosition: prefix|suffix - Symbol position. Default: "prefix"
- currencyDecimalPlaces: number - Number of decimal places (0-10). Default: 2
- currencyThousandsSeparator: string - Thousands separator (",", ".", " ", "'", ""). Default: ","
- currencyDecimalSeparator: string - Decimal separator ("." or ","). Default: "."
- currencySymbolColor: string - Symbol color. Default: "#666666"
- currencySymbolFontSize: string - Symbol font size. Default: "1em"
- currencySymbolPadding: string - Symbol padding. Default: "4px"

Slots: none

Events:
- change: {value: string|number} - Triggered when input value changes
- initValueChange: {value: string|number} - Triggered when initial value changes
- onEnterKey: {value: string|number} - Triggered when enter key is pressed
- focus: null - Triggered when input gains focus
- blur: null - Triggered when input loses focus

Variables:
- value: string|number - Current input value

Features:
- You can fully stylize the input by adding borders, background, hover state, etc...

Example:
<elements>
{"uid":0,"tag":"ww-input-basic","name":"Email Input","props":{"default":{"max":"10000","min":"0","rows":4,"step":1,"type":"text","value":"","resize":false,"maxDate":"","minDate":"","debounce":false,"readonly":false,"required":true,"fieldName":"email","precision":"0.1","hideArrows":false,"validation":{"js":"return wwFormulas.isEmail(context.local.data?.['form']?.['fields']?.['email']?.['value'])"},"autocomplete":false,"debounceDelay":"500ms","timePrecision":1,"displayPassword":false,"customValidation":true}},"styles":{"default":{...}}}
</elements>
