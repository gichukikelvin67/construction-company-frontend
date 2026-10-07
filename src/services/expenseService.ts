import api from "@/lib/api";

export interface Expense{
    _id:string;
    company:string;
    project:string;
    category:string;
    description?:string;
    amount:number;
    expenseDate?:string;
    isVoided?:boolean;
    voidedAt?:string;
    voidReason?:string;
    createdAt?:string;
    updatedAt?:string;
    receiptNumber?:string;
    notes?:string;
}
interface GetProjectExpensesResponse{
    success:boolean;
    project:{
        id:string;
        name:string;
    };
    count:number;
    totalAmount:number;
    expenses:Expense[];
}
export const getProjectExpenses=async(
    projectId:string
):Promise<GetProjectExpensesResponse> =>{
    const response=await api.get<GetProjectExpensesResponse>(
        `/expenses/project/${projectId}`
    )
    return response.data;
}
export interface CreateExpenseData {
  projectId: string;
  category:
    | "materials"
    | "transport"
    | "fuel"
    | "equipment"
    | "labour"
    | "permits"
    | "utilities"
    | "other";
  description: string;
  amount: number;
  expenseDate: string;
  receiptNumber?: string;
  notes?: string;
}

interface CreateExpenseResponse {
  success: boolean;
  message: string;
  expense: Expense;
}

export const createExpense = async (
  expenseData: CreateExpenseData
): Promise<Expense> => {
  const response = await api.post<CreateExpenseResponse>(
    "/expenses",
    expenseData
  );

  return response.data.expense;
};
export interface UpdateExpenseData {
  category?:
    | "materials"
    | "transport"
    | "fuel"
    | "equipment"
    | "labour"
    | "permits"
    | "utilities"
    | "other";
  description?: string;
  amount?: number;
  expenseDate?: string;
  receiptNumber?: string;
  notes?: string;
}

interface UpdateExpenseResponse {
  success: boolean;
  message: string;
  expense: Expense;
}

export const updateExpense = async (
  expenseId: string,
  expenseData: UpdateExpenseData
): Promise<Expense> => {
  const response = await api.patch<UpdateExpenseResponse>(
    `/expenses/${expenseId}`,
    expenseData
  );

  return response.data.expense;
};

interface VoidExpenseResponse {
  success: boolean;
  message: string;
  expense: Expense;
}

export const voidExpense = async (
  expenseId: string,
  reason: string
): Promise<Expense> => {
  const response = await api.patch<VoidExpenseResponse>(
    `/expenses/${expenseId}/void`,
    { reason }
  );

  return response.data.expense;
};