import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const NotFoundPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-primary-sandstone backdrop-blur-sm border border-primary-dawn/20 shadow-2xl">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <CardTitle className="text-3xl font-bold text-primary-black">
            Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-primary-black/80 text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="bg-primary-dawn/10 border border-primary-dawn/20 rounded-lg p-4">
            <p className="text-primary-black/70 text-sm">
              Error Code:{" "}
              <span className="font-mono text-primary-dawn">404</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
           

            <Button
              asChild
              variant="outline"
              className="border-primary-dawn/20 text-primary-black hover:bg-primary-dawn/10"
            >
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;
