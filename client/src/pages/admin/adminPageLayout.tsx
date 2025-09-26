import React, { ReactNode } from "react";

interface AdminPageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      </header>

      <div className="w-full">{children}</div>
    </>
  );
};

export default AdminPageLayout;
