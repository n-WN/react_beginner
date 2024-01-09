import React, { useState } from 'react';
import { FileSystemNode } from './FileSystemTypes';
import './FileSystemStyles.css';

const FileSystem: React.FC = () => {
    const [nodes, setNodes] = useState<FileSystemNode[]>([
        // 初始数据
        {
            id: '1',
            name: '文件夹1',
            type: 'folder',
            isOpen: false,
            children: [
                { id: '2', name: '文件1', type: 'file' },
                { id: '3', name: '文件2', type: 'file' },
            ]
        },
        { id: '4', name: '文件夹2', type: 'folder', isOpen: false, children: [] },
        { id: '5', name: '文件3', type: 'file' }
    ]);

    const toggleFolder = (id: string) => {
        setNodes(currentNodes =>
            currentNodes.map(node =>
                node.id === id
                    ? { ...node, isOpen: !node.isOpen }
                    : node
            )
        );
    };

    const handleDragStart = (e: React.DragEvent, node: FileSystemNode) => {
        e.dataTransfer.setData("node/id", node.id);
        e.stopPropagation();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, targetNode?: FileSystemNode) => {
        e.preventDefault();
        const draggedNodeId = e.dataTransfer.getData("node/id");

        setNodes(currentNodes => {
            // 深拷贝当前节点数据
            let newNodes = JSON.parse(JSON.stringify(currentNodes));
            const draggedNode = findNode(newNodes, draggedNodeId);

            // 从原位置移除被拖动的节点
            removeNode(newNodes, draggedNodeId);

            if (targetNode) {
                // 如果有目标节点，且目标节点是文件夹
                const targetFolder = targetNode.type === 'folder' ? findNode(newNodes, targetNode.id) : null;
                if (draggedNode && targetFolder) {
                    targetFolder.children = [...(targetFolder.children || []), draggedNode];
                }
            } else {
                // 如果没有目标节点，表示拖放到根目录
                if (draggedNode) {
                    newNodes.push(draggedNode);
                }
            }

            return newNodes;
        });

        e.stopPropagation();
    };





    const findNode = (nodes: FileSystemNode[], id: string): FileSystemNode | null => {
        for (let node of nodes) {
            if (node.id === id) {
                return node;
            }
            if (node.children) {
                const found = findNode(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const removeNode = (nodes: FileSystemNode[], id: string): void => {
        const index = nodes.findIndex(node => node.id === id);
        if (index > -1) {
            nodes.splice(index, 1);
        } else {
            nodes.forEach(node => {
                if (node.children) {
                    removeNode(node.children, id);
                }
            });
        }
    };

    const renderTree = (nodes: FileSystemNode[]): JSX.Element => {
        return (
            <ul>
                {nodes.map(node => (
                    <li
                        key={node.id}
                        className={`node ${node.type}`}
                        draggable={node.type === 'folder' || node.type === 'file'}
                        onDragStart={(e) => handleDragStart(e, node)}
                        onDragOver={node.type === 'folder' ? handleDragOver : undefined}
                        onDrop={node.type === 'folder' ? (e) => handleDrop(e, node) : undefined}
                        onClick={(e) => {
                            if (node.type === 'folder') {
                                toggleFolder(node.id);
                            }
                            e.stopPropagation();
                        }}
                    >
                        {node.name}
                        {node.type === 'folder' && (!node.children || node.children.length === 0) && <span> (空)</span>}
                        {node.isOpen && node.children && renderTree(node.children)}
                    </li>
                ))}
            </ul>
        );
    };

    // return <div>{renderTree(nodes)}</div>;
    // 在根目录元素上添加拖放事件处理器
    return (
        <div
            className="root"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e)}
        >
            {renderTree(nodes)}
        </div>
    );
};

export default FileSystem;
