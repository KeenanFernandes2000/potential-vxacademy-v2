import React from "react";

const Icon = ({
  Component,
  size = 30,
  color = "#000",
  className = "",
}: {
  Component: React.ComponentType<any> | React.ReactElement;
  size?: number;
  color?: string;
  className?: string;
}) => {
  // If Component is already a JSX element, return it as is
  if (React.isValidElement(Component)) {
    return Component;
  }

  // If Component is a component type, render it with props
  return <Component style={{ fontSize: size, color }} className={className} />;
};

export default Icon;
