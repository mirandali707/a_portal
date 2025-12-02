// Factory function to create a clear button controller
// buttonId: string - ID of the clear button element
// resetPathFunction: function or string - Function to call, or name of function on window object
function createClearButton(buttonId, resetPathFunction) {
    const clearBtn = document.getElementById(buttonId);
    
    if (!clearBtn) {
        console.warn(`Clear button with ID "${buttonId}" not found`);
        return null;
    }
    
    clearBtn.addEventListener("click", () => {
        // Get the function - either use the provided function or look it up on window
        let fn = resetPathFunction;
        if (typeof resetPathFunction === 'string') {
            // If it's a string, look it up on the window object at click time
            fn = window[resetPathFunction];
        }
        
        // Call the function if it exists
        if (fn && typeof fn === 'function') {
            fn();
        }
    });
    
    return {
        element: clearBtn
    };
}