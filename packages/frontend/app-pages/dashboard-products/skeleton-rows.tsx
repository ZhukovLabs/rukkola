import {Skeleton, SkeletonText, Table} from "@chakra-ui/react";

export const SkeletonRows = ({columnsCount = 7}: { columnsCount?: number }) => (
    <>
        {Array.from({length: 10}).map((_, idx) => (
            <Table.Row key={`skeleton-${idx}`} bg="gray.900" borderBottom="1px solid" borderColor="gray.800">
                {Array.from({length: columnsCount}).map((_, i) => (
                    <Table.Cell key={i} p={4}>
                        {i === 0 ? <Skeleton boxSize="24px"/> :
                            i === 1 ? <Skeleton boxSize="60px" borderRadius="md"/> :
                                <SkeletonText noOfLines={2} width={`${80 + Math.random() * 100}px`}/>}
                    </Table.Cell>
                ))}
            </Table.Row>
        ))}
    </>
)