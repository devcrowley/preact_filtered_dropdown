/*

dropdown.jsx

A filterable dropdown selector

Passable Properties:

placeholder {string}    : Placeholder text to show when the input is empty
value {string}          : An optional starting value
expanded {boolean}      : When true, shows the full options list when the input gains focus. When false, 
                          the options list only appears when the user is inputting data
disableFiltering {boolean} : When true, always show the full unfiltered options list without hiding any options
onChange {function}     : Fires when the value in the dropdown changes
styleSheet {object}     : A CSS style sheet to append to the native Dropdown style sheet,
                          for overriding CSS elements

Created by Devin Crowley

Developer NOTE:  Similar functionality already exists natively in HTML5, but the dropdown.jsx
version has some fancy stylings and handlers.  Also, the native dropdown shows values AND value
text together which can't be changed through simple css or attributes

    <input type="text" name="product" list="productName"/>
    <datalist id="productName">
        <option value="Pen">Pen</option>
        <option value="Pencil">Pencil</option>
        <option value="Paper">Paper</option>
    </datalist>

*/

import { cloneElement } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import style from './dropdown.css';

function Dropdown( {placeholder, children = [], value, onChange, expanded, disableFiltering = false, styleSheet = {}} ) {

    // Append any custom stylesheets passed via the styleSheet prop
    styleSheet = {...style, ...styleSheet};

    // If the user passed a value, try and find a child element with the same value
    // and set its inner text as the input value
    let initialFilter = "";
    if(value) {
        initialFilter = findChildByValue(children, value).text;
    }

    // Give access to all states and setStates to child elements
    const state = {};
    state.onChange = onChange;
    state.alwaysExpanded = expanded;
    [state.expanded, state.setExpanded] = useState(false);
    [state.filter, state.setFilter] = useState(initialFilter);
    [state.value, state.setValue] = useState(value || "");

    // Access to DOM elements to change stylings after rendering as needed
    const domElement = {};

    // Sets the width of the dropdown to match the full input area and prevents going outside the window
    useEffect(()=>{
        resizeToBounds();
    })

    function resizeToBounds() {
        const inputBBox = domElement.input.getBoundingClientRect();
        const optionsBBox = domElement.options.getBoundingClientRect();
        const height = domElement.options.scrollHeight;
        domElement.options.style.width = inputBBox.width - 1 + "px";
        if(height + optionsBBox.y > window.innerHeight - 10) {
            domElement.options.style.height = (window.innerHeight - 10 - optionsBBox.y) + "px";
        } else {
            domElement.options.style.height = '';
        }
    }

    return (
        <div className={styleSheet.dropdown}>
            <div className={styleSheet.input}>

                {/* Placeholder label */}
                {state.filter ? null : 
                    <label 
                    className={style.placeholder}
                    onClick={evt=>{
                        domElement.input.focus();
                    }}
                    >
                        {placeholder}
                    </label>
                }


                {/* The filter/search input for filtering the options in the list */}
                <input 
                onBlur={()=>{
                    if(state.expanded) {
                        setTimeout(()=>state.setExpanded(false), 10);
                    }
                }}
                onInput={handleInputChange}
                onFocus={handleInputChange}
                value={state.filter}
                ref={elem=>{
                    domElement.input = elem;
                }}
                />

                {/* A button to clear the input */}
                <div className={styleSheet.btn_clear}
                onClick={()=>{
                    if(state.filter !== "") state.setFilter("");
                    if(state.value !== "") {;
                        state.setValue("");
                        if(state.onChange) state.onChange("");
                    }
                }}
                ></div>

                {/* A button for expanding the options list */}
                <div className={styleSheet.btn_expand}
                onClick={()=>{
                    state.setExpanded(!state.expanded);
                    domElement.input.focus();
                }}
                ></div>

            </div>

            <div 
            className={state.expanded ? styleSheet.expanded : styleSheet.collapsed}
            ref={elem=>{
                domElement.options = elem;
            }}
            >
                <FilteredChildren disableFiltering={disableFiltering} state={state}>{children}</FilteredChildren>
            </div>
            
        </div>
    )

    function handleInputChange(evt) {
        if(evt.target.value !== "" || state.alwaysExpanded) {
            state.setExpanded(true);
        } else {
            state.setExpanded(false);
        }
        state.setExpanded(true);
        state.setFilter(evt.target.value);
        resizeToBounds();
    }
}

/**
 * Filters the list of options based on their text content
 * @param {*} param0 
 * @returns 
 */
function FilteredChildren({children, state, disableFiltering}) {
    if(!Array.isArray(children) || children.length < 1) return [];

    const options = [];

    

    // Add events to all child elements (options) to handle clicks
    children.forEach(c=>{
        const compare = textContent(c);
        if(compare.includes(state.filter.toLowerCase().trim()) || disableFiltering) {
            const childClone = cloneElement(c, { onMouseDown: handleClick, className: c.props.className + ' ' + style.option});
            options.push(childClone);
        }
    })

    // Click handler for all child elements (options)
    function handleClick(evt) {
        const value = evt.target.value || evt.target.getAttribute('value');
        state.setValue(value);
        state.setFilter(evt.target.innerText);
        state.setExpanded(false);
        if(state.onChange) state.onChange(value);
    }

    return options;
}

/**
 * Locates a child element based on its value
 * @param {array} children 
 * @param {string} value 
 * @returns object with two keys:  child (component) and its displayed text
 */
function findChildByValue(children, value) {

    if(!Array.isArray(children) || children.length < 1) return {child: null, text: ""};

    const retVal = {
        child: null,
        text: ""
    };

    children.forEach(c=>{
        if(!c.props) return;
        if(c.props.value === value) {
            retVal.child = c;
            retVal.text = textContent(c);
        }
    });

    return retVal;
}


// Get the complete text content of a React element and its children, similar to native domelement.innerText
function textContent(elem) {
    if (!elem) {
      return '';
    }
    if (typeof elem === 'string') {
      return elem;
    }

    const children = elem.props && elem.props.children;
    if (children instanceof Array) {
      return children.map(textContent).join('');
    }
    return textContent(children);
}

export default Dropdown;

