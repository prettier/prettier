// Test using implicit declare functions
import {ImplicitFunctions} from './implicit_functions';

// Valid uses
const greeting: string = ImplicitFunctions.greet("World");
const sum: number = ImplicitFunctions.add(1, 2);

// Explicit helper still works
ImplicitFunctions.explicitHelper();

// Error cases - type mismatches
const badGreeting: number = ImplicitFunctions.greet("World"); // Error: string not assignable to number
const badAdd: string = ImplicitFunctions.add(1, 2); // Error: number not assignable to string
ImplicitFunctions.greet(123); // Error: number not assignable to string
ImplicitFunctions.add("a", "b"); // Error: string not assignable to number
