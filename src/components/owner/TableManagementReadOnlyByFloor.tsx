import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTableStore } from '@/store/tableStore';

interface TableManagementReadOnlyByFloorProps {
  branchId: string;
}

export const TableManagementReadOnlyByFloor = ({ branchId }: TableManagementReadOnlyByFloorProps) => {
  const getTablesByBranchAndFloor = useTableStore((state) => state.getTablesByBranchAndFloor);
  const floorMap = getTablesByBranchAndFloor(branchId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      case 'reserved':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const sortedFloors = Array.from(floorMap.keys()).sort((a, b) => a - b);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Table Layout (By Floor)</CardTitle>
        <CardDescription>View tables organized by floor - read-only</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedFloors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tables found for this branch</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedFloors.map((floor) => {
              const tables = floorMap.get(floor) || [];
              const sortedTables = tables.sort((a, b) => a.number - b.number);
              
              return (
                <div key={floor} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-lg px-4 py-2">
                      <h3 className="text-lg font-semibold text-primary">Floor {floor}</h3>
                    </div>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">
                      {tables.length} table{tables.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-6">
                    {sortedTables.map((table) => (
                      <Card key={table.id} className="border-border/50 hover:shadow-sm transition-shadow">
                        <CardContent className="pt-4 pb-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm">T{table.number}</span>
                              <div className="flex flex-col gap-1 items-end">
                                <Badge variant={getStatusColor(table.status)} className="text-xs">
                                  {table.status}
                                </Badge>
                                {table.reservationStart && (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                                    Reserved
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
                            </p>
                            {table.reservationName && (
                              <p className="text-xs text-muted-foreground truncate">
                                {table.reservationName}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
