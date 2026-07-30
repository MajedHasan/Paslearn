export interface SubmissionFile {
  fieldKey: string;
  originalName: string;
  url: string;
  mimeType: string;
}

export interface ISubmission {
  _id: string;
  form: any;
  formKey: string;
  formSnapshot: any;
  values: Record<string, any>;
  files?: SubmissionFile[];
  meta: Record<string, any>;
  status: "new" | "reviewed" | "processed" | "failed";
  notes: string;
  createdAt: string;
  updatedAt: string;
}