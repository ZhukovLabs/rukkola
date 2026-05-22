'use client';

import {useSortable} from '@dnd-kit/sortable';
import {GripVertical} from 'lucide-react';
import {IconButton, Table} from '@chakra-ui/react';
import type {ReactNode} from 'react';

type SortableRowProps = {
    id: string;
    children: ReactNode;
};

export function SortableRow({id, children}: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({id});

    const style = {
        transform: transform ? `translateY(${transform.y}px)` : undefined,
        transition,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <Table.Row
            ref={setNodeRef}
            style={style}
            bg={isDragging ? 'orange.900/20' : 'transparent'}
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            position="relative"
            zIndex={isDragging ? 10 : 1}
            _hover={{
                bg: isDragging ? 'orange.900/30' : 'whiteAlpha.50',
                boxShadow: isDragging ? '0 10px 40px rgba(0,0,0,0.6)' : 'none',
            }}
        >
            <Table.Cell p={2} w="40px" textAlign="center">
                <IconButton
                    aria-label="Перетащить"
                    size="xs"
                    variant="ghost"
                    color="gray.800"
                    cursor={isDragging ? 'grabbing' : 'grab'}
                    _hover={{ color: "gray.300", bg: "gray.700" }}
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical size={14}/>
                </IconButton>
            </Table.Cell>
            {children}
        </Table.Row>
    );
}