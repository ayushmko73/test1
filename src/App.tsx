import React, { useReducer } from 'react';
import { Delete } from 'lucide-react';

type State = {
  currentOperand: string | null;
  previousOperand: string | null;
  operation: string | null;
  overwrite?: boolean;
};

type Action = 
  | { type: 'add-digit'; payload: string }
  | { type: 'choose-operation'; payload: string }
  | { type: 'clear' }
  | { type: 'delete-digit' }
  | { type: 'evaluate' };

const INTEGER_FORMATTER = new Intl.NumberFormat('en-us', {
  maximumFractionDigits: 0,
});

function formatOperand(operand: string | null) {
  if (operand == null) return null;
  const [integer, decimal] = operand.split('.');
  if (decimal == null) return INTEGER_FORMATTER.format(parseFloat(integer));
  return `${INTEGER_FORMATTER.format(parseFloat(integer))}.${decimal}`;
}

function evaluate({ currentOperand, previousOperand, operation }: State): string {
  const prev = parseFloat(previousOperand || '');
  const current = parseFloat(currentOperand || '');
  if (isNaN(prev) || isNaN(current)) return '';
  let computation = 0;
  switch (operation) {
    case '+':
      computation = prev + current;
      break;
    case '-':
      computation = prev - current;
      break;
    case '*':
      computation = prev * current;
      break;
    case '÷':
      computation = prev / current;
      break;
  }
  return computation.toString();
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add-digit':
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: action.payload,
          overwrite: false,
        };
      }
      if (action.payload === '0' && state.currentOperand === '0') {
        return state;
      }
      if (action.payload === '.' && state.currentOperand?.includes('.')) {
        return state;
      }
      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${action.payload}`,
      };
    case 'choose-operation':
      if (state.currentOperand == null && state.previousOperand == null) {
        return state;
      }
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: action.payload,
        };
      }
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: action.payload,
          previousOperand: state.currentOperand,
          currentOperand: null,
        };
      }
      return {
        ...state,
        previousOperand: evaluate(state),
        operation: action.payload,
        currentOperand: null,
      };
    case 'clear':
      return {
        currentOperand: null,
        previousOperand: null,
        operation: null,
      };
    case 'delete-digit':
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        };
      }
      if (state.currentOperand == null) return state;
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null };
      }
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      };
    case 'evaluate':
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state;
      }
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      };
  }
  return state;
}

export default function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    {
      currentOperand: null,
      previousOperand: null,
      operation: null,
    }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-gray-800">
        {/* Display */}
        <div className="bg-gray-950 p-6 flex flex-col items-end justify-end h-32 break-all">
          <div className="text-gray-400 text-lg font-medium h-6">
            {formatOperand(previousOperand)} {operation}
          </div>
          <div className="text-white text-4xl font-bold tracking-wide mt-2">
            {formatOperand(currentOperand) || '0'}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-0.5 bg-gray-800 border-t border-gray-800">
          <button
            className="col-span-2 bg-gray-900 hover:bg-gray-800 text-cyan-400 text-xl font-semibold p-6 transition-colors"
            onClick={() => dispatch({ type: 'clear' })}
          >
            AC
          </button>
          <button
            className="bg-gray-900 hover:bg-gray-800 text-red-400 text-xl font-semibold p-6 flex items-center justify-center transition-colors"
            onClick={() => dispatch({ type: 'delete-digit' })}
          >
            <Delete size={24} />
          </button>
          <OperationButton operation="÷" dispatch={dispatch} />
          
          <DigitButton digit="7" dispatch={dispatch} />
          <DigitButton digit="8" dispatch={dispatch} />
          <DigitButton digit="9" dispatch={dispatch} />
          <OperationButton operation="*" dispatch={dispatch} />
          
          <DigitButton digit="4" dispatch={dispatch} />
          <DigitButton digit="5" dispatch={dispatch} />
          <DigitButton digit="6" dispatch={dispatch} />
          <OperationButton operation="-" dispatch={dispatch} />
          
          <DigitButton digit="1" dispatch={dispatch} />
          <DigitButton digit="2" dispatch={dispatch} />
          <DigitButton digit="3" dispatch={dispatch} />
          <OperationButton operation="+" dispatch={dispatch} />
          
          <DigitButton digit="." dispatch={dispatch} />
          <DigitButton digit="0" dispatch={dispatch} />
          <button
            className="col-span-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xl font-semibold p-6 transition-colors"
            onClick={() => dispatch({ type: 'evaluate' })}
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}

function DigitButton({ dispatch, digit }: { dispatch: React.Dispatch<Action>; digit: string }) {
  return (
    <button
      className="bg-gray-900 hover:bg-gray-800 text-white text-xl font-medium p-6 transition-colors"
      onClick={() => dispatch({ type: 'add-digit', payload: digit })}
    >
      {digit}
    </button>
  );
}

function OperationButton({ dispatch, operation }: { dispatch: React.Dispatch<Action>; operation: string }) {
  return (
    <button
      className="bg-gray-900 hover:bg-gray-800 text-cyan-400 text-xl font-bold p-6 transition-colors"
      onClick={() => dispatch({ type: 'choose-operation', payload: operation })}
    >
      {operation}
    </button>
  );
}