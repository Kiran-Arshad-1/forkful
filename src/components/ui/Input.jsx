import React from "react";
import { cn } from "../../utils/cn";

const Input = React.forwardRef(({ className, type = "text", label, description, error, required = false, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random()?.toString(36)?.substr(2, 9)}`;

    const baseInputClasses = "flex h-10 w-full rounded-lg border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-250" +" bg-[#1E3A9E] border-[rgba(201,168,76,0.3)] text-white placeholder:text-[#9BA4E8]/60 focus-visible:ring-[#C9A84C] focus-visible:border-[#C9A84C]";

    if (type === "checkbox") {
        return (
            <input
                type="checkbox"
                className={cn("h-4 w-4 rounded border-[rgba(201,168,76,0.5)] bg-[#1E3A9E] text-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50", className)}
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
                className={cn("h-4 w-4 rounded-full border-[rgba(201,168,76,0.5)] bg-[#1E3A9E] text-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50", className)}
                ref={ref}
                id={inputId}
                {...props}
            />
        );
    }

    return (
        <div className="space-y-2">
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn("text-sm font-medium leading-none", error ? "text-red-400" : "text-white")}
                >
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            <input
                type={type}
                className={cn(baseInputClasses, error && "border-red-400 focus-visible:ring-red-400", className)}
                ref={ref}
                id={inputId}
                {...props}
            />

            {description && !error && (
                <p className="text-sm" style={{ color: '#9BA4E8' }}>{description}</p>
            )}

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    );
});

Input.displayName = "Input";
export default Input;