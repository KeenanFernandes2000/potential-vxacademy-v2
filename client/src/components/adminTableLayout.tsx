import React, { ReactNode, useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminTableLayoutProps {
  searchPlaceholder?: string;
  createButtonText?: string;
  createForm: ReactNode;
  tableData: any[];
  columns: string[];
  onSearch?: (query: string) => void;
}

const AdminTableLayout: React.FC<AdminTableLayoutProps> = ({
  searchPlaceholder = "Search...",
  createButtonText = "Create",
  createForm,
  tableData,
  columns,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="space-y-4">
      {/* Search and Create Section */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/60" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-[#00d8cc] focus:ring-[#00d8cc]"
          />
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#00d8cc] hover:bg-[#00b8b0] text-black font-semibold"
              style={{ minWidth: "120px", height: "40px" }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-[#003451] border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {createButtonText}
              </DialogTitle>
            </DialogHeader>
            {createForm}
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white/10 backdrop-blur-sm border-white/20 max-w-[80%]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/20">
              {columns.map((column) => (
                <TableHead key={column} className="text-white font-semibold">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow
                key={index}
                className="border-white/20 hover:bg-white/5"
              >
                {Object.values(row).map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-white/90">
                    {String(cell)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminTableLayout;
