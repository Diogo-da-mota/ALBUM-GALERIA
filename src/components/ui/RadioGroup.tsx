
import React from "react";
import { CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface RadioOption {
  id: string | number;
  label: string;
  price?: number;
}

interface RadioGroupProps {
  title: string;
  options: RadioOption[];
  selectedId: string | number | null;
  onChange: (id: string | number) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  title,
  options,
  selectedId,
  onChange,
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.id}
            className={cn(
              "flex items-center p-3 rounded-lg cursor-pointer border",
              selectedId === option.id
                ? "border-album-highlight bg-album-card/80"
                : "border-muted bg-album-card/50"
            )}
            onClick={() => onChange(option.id)}
          >
            <div className="mr-3">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2",
                  selectedId === option.id
                    ? "border-album-highlight"
                    : "border-muted-foreground"
                )}
              >
                {selectedId === option.id && (
                  <div className="w-3 h-3 bg-album-highlight rounded-full m-[3px]"></div>
                )}
              </div>
            </div>
            <span className="flex-grow">{option.label}</span>
            {option.price !== undefined && (
              <div className="flex items-center">
                <CircleDollarSign size={16} className="text-album-accent mr-1" />
                <span className="text-album-accent font-medium">
                  R$ {option.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;
