# Preact Filtered Dropdown List

A dropdown for React/Preact with a filtered input

While there is a similar native HTML5 element for filtered dropdowns (datalist) they have limited control over their stylings and functionality.  I created a React/Preact version to make up for the limits of the native version.

## Usage

The dropdown component relies on a list of child elements.  Typically you'd want to use `<option>` tags, but it should work with any tag as long as you provide a `value` attribute.  This allows for lists of other elements such as hyperlinks

Note that this component was originally designed for Preact, but it can be easily modified for React by changing the includes at the top of the dropdown.jsx file.

## Passable Properties

* placeholder {string} : Placeholder text to show when the input is empty
* value {string} : An optional starting value
* expanded {boolean} : When true, shows the full options list when the input gains focus.  When false, the options list only appears when the user is inputting data
* onChange {function} : Fires when the value in the dropdown changes
* styleSheet:  A custom CSS style sheet to append to the native Dropdown style sheet (for overriding CSS elements)

## Example Usage

```jsx
import Dropdown from './dropdown';

function MyComponent() {
  return (
    <Dropdown
    expanded={true}
    onChange={val=>{
      console.log("Value Value changed to ", val);
    }}
    >
      <option value="1">Carrot</option>
      <option value="2">Peanut</option>
      <option value="3">Banana</option>
      <option value="4">Orange</option>
      <option value="5">Lawn Clippings</option>
      <option value="6">Carrot Cake</option>
      <option value="7">Peanut Butter</option>
    </Dropdown>
  )
}

```
