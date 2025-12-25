export interface Document {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'pending';
    uploadDate: string;
}

export const MOCK_DOCUMENTS: Document[] = [
    { id: '1', name: 'GDPR_Full_Text.pdf', status: 'active', uploadDate: '2023-10-01' },
    { id: '2', name: 'ISO_27001_Standard.pdf', status: 'inactive', uploadDate: '2023-11-15' },
    { id: '3', name: 'India_DPDP_Act_2023.pdf', status: 'inactive', uploadDate: '2024-01-20' },
];
