// Factory function to create a clear button controller
// buttonId: string - ID of the clear button element
function createClearButton(buttonId) {
    const clearBtn = document.getElementById(buttonId);
    
    if (!clearBtn) {
        console.warn(`Clear button with ID "${buttonId}" not found`);
        return null;
    }
    
    clearBtn.addEventListener("click", () => {
        // Reset the path immediately
        if (window.resetPath) {
            window.resetPath();
        }
    });
    
    return {
        element: clearBtn
    };
}