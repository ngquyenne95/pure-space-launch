import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useTableStore } from '@/store/tableStore';
import { useReservationStore } from '@/store/reservationStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Eye, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { TableStatusDialog } from '@/components/staff/TableStatusDialog';
import { TableDetailsDialog } from '@/components/staff/TableDetailsDialog';

const TablesPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '';
  const { getTablesByBranchAndFloor, getTableById } = useTableStore();
  const { getReservationsByTable } = useReservationStore();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [reservationIndexMap, setReservationIndexMap] = useState<Map<string, number>>(new Map());

  const floorMap = getTablesByBranchAndFloor(branchId);
  const branchTables = Array.from(floorMap.values()).flat().filter(t => t.status !== 'out_of_service');

  const handleViewDetails = (tableId: string) => {
    setSelectedTable(tableId);
    setDetailsDialogOpen(true);
  };

  const handleChangeStatus = (tableId: string) => {
    setSelectedTable(tableId);
    setStatusDialogOpen(true);
  };

  const getTableReservations = (tableId: string) => {
    return getReservationsByTable(tableId);
  };

  const getCurrentReservationIndex = (tableId: string) => {
    return reservationIndexMap.get(tableId) || 0;
  };

  const handleNextReservation = (tableId: string, maxIndex: number) => {
    const currentIndex = getCurrentReservationIndex(tableId);
    const newIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
    setReservationIndexMap(new Map(reservationIndexMap.set(tableId, newIndex)));
  };

  const handlePrevReservation = (tableId: string, maxIndex: number) => {
    const currentIndex = getCurrentReservationIndex(tableId);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
    setReservationIndexMap(new Map(reservationIndexMap.set(tableId, newIndex)));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Table Management</h2>
      </div>

      <div className="space-y-6">
        {Array.from(floorMap.keys()).sort((a, b) => a - b).map((floor) => {
          const floorTables = (floorMap.get(floor) || [])
            .filter(t => t.status !== 'out_of_service')
            .sort((a, b) => a.number - b.number);
          
          if (floorTables.length === 0) return null;
          
          return (
            <div key={floor} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg px-4 py-2">
                  <h3 className="text-lg font-semibold text-primary">Floor {floor}</h3>
                </div>
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">
                  {floorTables.length} table{floorTables.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {floorTables.map((table) => {
                  const tableReservations = getTableReservations(table.id);
                  const currentResIndex = getCurrentReservationIndex(table.id);
                  const currentReservation = tableReservations[currentResIndex];

                  return (
                    <Card key={table.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">Table {table.number}</CardTitle>
                          <div className="flex flex-col gap-2 items-end">
                            <Badge variant={getStatusColor(table.status)}>
                              {table.status}
                            </Badge>
                            {tableReservations.length > 0 && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                                <Calendar className="h-3 w-3 mr-1" />
                                {tableReservations.length} {tableReservations.length === 1 ? 'Reservation' : 'Reservations'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Capacity: {table.capacity} guests</span>
                        </div>
                        
                        {currentReservation && (
                          <div className="space-y-2 p-3 bg-muted rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                Reservation {currentResIndex + 1}/{tableReservations.length}
                              </div>
                              {tableReservations.length > 1 && (
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePrevReservation(table.id, tableReservations.length - 1);
                                    }}
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNextReservation(table.id, tableReservations.length - 1);
                                    }}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p className="font-medium">Guest: {currentReservation.guestName}</p>
                              <p>Party size: {currentReservation.numberOfGuests} guests</p>
                              <p>From: {new Date(currentReservation.reservationStart).toLocaleString()}</p>
                              <p>To: {new Date(currentReservation.reservationEnd).toLocaleString()}</p>
                              {currentReservation.notes && (
                                <p className="italic pt-1 border-t">Note: {currentReservation.notes}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {table.status === 'occupied' && tableReservations.length === 0 && (
                          <div className="space-y-2 p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4" />
                              <span>Currently occupied</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleViewDetails(table.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={() => handleChangeStatus(table.id)}
                          >
                            Change Status
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
