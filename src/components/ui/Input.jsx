import React from "react";
import { cn } from "../../utils/cn";

const Input = React.forwardRef(({ className, type = "text", label, description, error, required = false, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random()?.toString(36)?.substr(2, 9)}`;

    const baseInputClasses = "flex h-11 w-full rounded-xl border px-3.5 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200" +" bg-[#081C49] border-[#1D4ED8] text-white placeholder:text-[#647DBA] focus-visible:ring-[#FBC33B] focus-visible:border-[#FBC33B]";

    if (type === "checkbox") {
        return (
            <input
                type="checkbox"
                className={cn("h-4 w-4 rounded border-[#1D4ED8] bg-[#081C49] text-[#FBC33B] focus:ring-2 focus:ring-[#FBC33B] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer", className)}
                ref={ref}
                id={inputId}
                {...props}
            />
        );
    }

    if (type === "radio") {
        return (
            <input
                type="radio"
                className={cn("h-4 w-4 rounded-full border-[#1D4ED8] bg-[#081C49] text-[#FBC33B] focus:ring-2 focus:ring-[#FBC33B] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer", className)}
                ref={ref}
                id={inputId}
                {...props}
            />
        );
    }

    return (
        <div className="space-y-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn("text-sm font-semibold leading-none", error ? "text-[#FF4D5E]" : "text-white")}
                >
                    {label}
                    {required && <span className="text-[#FF4D5E] ml-1">*</span>}
                </label>
            )}

            <input
                type={type}
                className={cn(baseInputClasses, error && "border-[#FF4D5E] focus-visible:ring-[#FF4D5E]", className)}
                ref={ref}
                id={inputId}
                {...props}
            />

            {description && !error && (
                <p className="text-xs font-medium" style={{ color: '#9FB5F5' }}>{description}</p>
            )}

            {error && (
                <p className="text-xs font-medium text-[#FF4D5E]">{error}</p>
            )}
        </div>
    );
});

Input.displayName = "Input";
export default Input;