/*

dropdown.jsx

A filterable dropdown selector

Passable Properties:

value:      The starting / default value
onChange:   Function to run when the value changes (returns value as the only argument)
expanded    Always show the list of choices as expanded when focused
styleSheet  A stylesheet to override the main stylesheet

Copyright 2022, Devin Crowley

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

import { cloneElement, options } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import style from './dropdown.css';

function Dropdown( {children, value, onChange, expanded, styleSheet = {}} ) {

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

    // Sets the width of the dropdown to match the full inout area
    useEffect(()=>{
        domElement.options.style.width = domElement.input.getBoundingClientRect().width - 1 + "px";
    })

    return (
        <div className={styleSheet.dropdown}>
            <div className={styleSheet.input}>

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
                <button className={styleSheet.btn_expand}
                onClick={()=>{
                    state.setExpanded(!state.expanded);
                    domElement.input.focus();
                }}
                ></button>

            </div>

            <div 
            className={state.expanded ? styleSheet.expanded : styleSheet.collapsed}
            ref={elem=>{
                domElement.options = elem;
            }}
            >
                <FilteredChildren state={state}>{children}</FilteredChildren>
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
    }
}

/**
 * Filters the list of options based on their text content
 * @param {*} param0 
 * @returns 
 */
function FilteredChildren({children, state}) {
    const options = [];

    // Add events to all child elements (options) to handle clicks
    children.forEach(c=>{
        if(c.props.children.join('').toLowerCase().trim().includes(state.filter.toLowerCase().trim())) {
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
    const retVal = {
        child: null,
        text: ""
    };

    children.forEach(c=>{
        if(c.props.value === value) {
            retVal.child = c;
            retVal.text = c.props.children.join('');
        }
    });

    return retVal;
}

export default Dropdown;

