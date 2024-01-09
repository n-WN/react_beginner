export interface FileSystemNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    children?: FileSystemNode[];
    isOpen?: boolean;
}
