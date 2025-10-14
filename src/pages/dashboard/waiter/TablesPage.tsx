import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useTableStore } from "@/store/tableStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Eye } from "lucide-react";
import { TableStatusDialog } from "@/components/staff/TableStatusDialog";
import { TableDetailsDialog } from "@/components/staff/TableDetailsDialog";

const TablesPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || "";
  const { getTablesByBranchAndFloor } = useTableStore();

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const floorMap = getTablesByBranchAndFloor(branchId);
  const handleViewDetails = (id: string) => {
    setSelectedTable(id);
    setDetailsDialogOpen(true);
  };
  const handleChangeStatus = (id: string) => {
    setSelectedTable(id);
    setStatusDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "default";
      case "occupied":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Table Management</h2>
      </div>

      <div className="space-y-8">
        {Array.from(floorMap.keys())
          .sort((a, b) => a - b)
          .map((floor) => {
            const floorTables = (floorMap.get(floor) || [])
              .filter((t) => t.status !== "out_of_service")
              .sort((a, b) => a.number - b.number);
            if (floorTables.length === 0) return null;

            return (
              <div key={floor} className="space-y-4">
                {/* --- Floor Header --- */}
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-lg px-4 py-2">
                    <h3 className="text-lg font-semibold text-primary">
                      Floor {floor}
                    </h3>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">
                    {floorTables.length} table
                    {floorTables.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* --- Table Cards --- */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {floorTables.map((table, index) => (
                      <motion.div
                        key={table.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <Card
                          className={`flex flex-col h-full border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-2xl ${
                            table.status === "occupied"
                              ? "border-red-300/70 bg-red-50"
                              : table.reservationStart
                              ? "border-orange-300/70 bg-orange-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg font-semibold">
                                Table {table.number}
                              </CardTitle>
                              <div className="flex flex-col gap-2 items-end">
                                <Badge variant={getStatusColor(table.status)}>
                                  {table.status}
                                </Badge>
                                {table.reservationStart && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-orange-100 text-orange-800"
                                  >
                                    Reserved
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="flex flex-col flex-1">
                            {/* --- Info --- */}
                            <div className="flex flex-col flex-1">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <Users className="h-4 w-4" />
                                <span>
                                  Capacity: {table.capacity} guests
                                </span>
                              </div>

                              {/* --- Reservation Animation --- */}
                              <AnimatePresence mode="wait">
                                {table.reservationName &&
                                table.reservationStart ? (
                                  <motion.div
                                    key="reservation"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.25 }}
                                    className="rounded-lg border bg-orange-50 p-3 mb-3 shadow-sm"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <Clock className="h-4 w-4 text-orange-600" />
                                      <span className="font-medium text-sm text-orange-700">
                                        Reservation Details
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1 ml-6">
                                      <p>
                                        <span className="font-semibold text-foreground">
                                          Guest:
                                        </span>{" "}
                                        {table.reservationName}
                                      </p>
                                      <p>
                                        From:{" "}
                                        {new Date(
                                          table.reservationStart
                                        ).toLocaleString()}
                                      </p>
                                      {table.reservationEnd && (
                                        <p>
                                          To:{" "}
                                          {new Date(
                                            table.reservationEnd
                                          ).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </motion.div>
                                ) : table.status === "occupied" ? (
                                  <motion.div
                                    key="occupied"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="rounded-lg border bg-muted p-3 mb-3 shadow-sm"
                                  >
                                    <div className="flex items-center gap-2 text-sm">
                                      <Clock className="h-4 w-4" />
                                      <span>Currently occupied</span>
                                    </div>
                                  </motion.div>
                                ) : null}
                              </AnimatePresence>
                            </div>

                            {/* --- Buttons --- */}
                            <div className="flex gap-2 mt-auto pt-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleViewDetails(table.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Details
                              </Button>
                              <Button
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={() => handleChangeStatus(table.id)}
                              >
                                Change Status
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
      </div>

      {selectedTable && (
        <>
          <TableStatusDialog
            tableId={selectedTable}
            open={statusDialogOpen}
            onOpenChange={setStatusDialogOpen}
          />
          <TableDetailsDialog
            tableId={selectedTable}
            branchId={branchId}
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default TablesPage;
