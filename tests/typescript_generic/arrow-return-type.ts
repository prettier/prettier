export const getVehicleDescriptor = async (
  vehicleId: string,
): Promise<
  Descriptor | undefined
> => {}


export const getVehicleDescriptor = async (
  vehicleId: string,
): Promise<
  Collections.Parts.PrintedCircuitBoardAssembly['attributes'] | undefined
> => {}

export const fun1 = async (
  vehicleId: string,
): Promise<
  Collections.Parts.PrintedCircuitBoardAssembly['attributes'] & undefined
> => {}

export const fun2 = async (
  vehicleId: string,
): Promise<
  Collections.Parts.PrintedCircuitBoardAssembly['attributes']
> => {}

export const fun3 = async (
  vehicleId: string,
): Promise<
  keyof Collections.Parts.PrintedCircuitBoardAssembly['attributes']
> => {}

export const fun4 = async (
  vehicleId: string,
): Promise<
  Collections.Parts.PrintedCircuitBoardAssembly[]
> => {}
