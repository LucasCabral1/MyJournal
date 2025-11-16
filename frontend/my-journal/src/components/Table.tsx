import React, { useMemo, useState } from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';
import type { Journal } from '../interface';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Select,
  Pagination,
  Label,
  Button,
} from 'flowbite-react';


import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type CellContext,
  type HeaderContext
} from '@tanstack/react-table';
interface Article {
  id: string | number;
  image_url?: string | null;
  title: string;
  author?: string | null;
  topic?: string | null;
  published_at: string | Date;
  url: string;
  summary?: string | null;
  journal: Journal;
}

import styles from './Dialog/dialog-styles.module.css';

import ControlledDialog from './DialogControlled/DialogControlled';

interface ArticlesTableProps {
  articles: Article[];
}

const ArticlesTable: React.FC<ArticlesTableProps> = ({ articles }) => {
  const [journalFilter, setJournalFilter] = useState<string>(''); 
  const [openModal, setOpenModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const formatDate = (dateString: string | Date): string => {
    return new Date(dateString)
      .toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(',', ' -');
  };

  const columns = useMemo<ColumnDef<Article>[]>(
    () => [
      {
        id: 'image',
        header: 'Imagem',
        cell: ({ row }) => {
          const article = row.original;
          return article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-24 h-16 object-cover rounded"
            />
          ) : (
            <div className="w-24 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              <Newspaper size={24} />
            </div>
          );
        },
      },
      {
        accessorKey: 'title',
        header: 'Título',
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900 whitespace-nowrap max-w-xs truncate">
            {String(getValue() ?? '')}
          </span>
        ),
      },
      {
        accessorFn: (row) => row.journal?.name ?? 'N/A',
        id: 'journal',
        header: 'Fonte',
        cell: ({ getValue }) => <span>{String(getValue() ?? 'N/A')}</span>,
      },
      {
        accessorKey: 'topic',
        header: 'Tópico',
        cell: ({ getValue }) => <span>{String(getValue() ?? 'N/A')}</span>,
      },
      {
        accessorKey: 'published_at',
        header: 'Publicado em',
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">
            {formatDate(getValue() as string | Date)}
          </span>
        ),
      },
      {
        id: 'link',
        header: 'Link',
        cell: ({ row }) => {
          const article = row.original;
          return (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center font-medium text-cyan-600 hover:underline"
            >
              Ver Artigo <ExternalLink size={14} className="ml-1" />
            </a>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: articles ?? [],
    columns,
    state: {
      globalFilter: journalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue) return true;
      const journalName = row.original.journal?.name?.toLowerCase() ?? '';
      return journalName.includes(String(filterValue).toLowerCase());
    },
  });

  const journalOptions = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.journal?.name) {
        set.add(a.journal.name);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [articles]);

  if (!articles || articles.length === 0) {
    return (
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg p-6 text-center text-gray-500">
        Nenhum artigo encontrado.
      </div>
    );
  }

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  const handleRowClick = (article: Article) => {
    setSelectedArticle(article);
    setOpenModal(true);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="max-w-md">
            <div className="mb-2 block">
                <Label htmlFor="countries">Filtrar Fonte</Label>
            </div>
          <Select
            id="journalFilter"
            value={journalFilter}
            onChange={(e) => {
              const value = e.target.value;
              setJournalFilter(value);
              table.setPageIndex(0);
            }}
            className="w-56"
          >
            <option value="">Todas</option>
            {journalOptions.map((journal) => (
              <option key={journal} value={journal}>
                {journal}
              </option>
            ))}
          </Select>
        </div>

        <div className="max-w-md">
          <div className="mb-2 block">
                <Label htmlFor="countries">Filtrar Fonte</Label>
            </div>
            
          <Select
            value={pageSize.toString()}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="w-24"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <Table>
          <TableHead>
            <TableRow>
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <TableHeadCell key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header instanceof Function
                      ? header.column.columnDef.header({
                          column: header.column,
                          table,
                        }  as HeaderContext<Article, unknown>)
                      : header.column.columnDef.header}
                  </TableHeadCell>
                ))
              )}
            </TableRow>
          </TableHead>

          <TableBody className="divide-y">
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4"
                >
                  Nenhum artigo encontrado para o filtro selecionado.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50"
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4">
                      {cell.column.columnDef.cell instanceof Function
                        ? cell.column.columnDef.cell({
                            row,
                            getValue: cell.getValue,
                            column: cell.column,
                            table,
                          } as CellContext<Article, unknown>)
                        : (cell.getValue() as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
            
      <div className="flex overflow-x-auto justify-center">

        <Pagination
          currentPage={pageIndex + 1}
          totalPages={pageCount || 1}
          onPageChange={(page) => {
            table.setPageIndex(page - 1);
          }}
          showIcons
        />
      </div>

      
      {selectedArticle && (
    <ControlledDialog
      open={openModal}
      onOpenChange={setOpenModal}
      title={selectedArticle.title}
      popupClassName="max-w-2xl"
      
      actions={
        <Button
          href={selectedArticle.url}
          rel="noopener noreferrer"
          className={`${styles.Button} flex items-center`}
        >
          <ExternalLink size={16} className="mr-2" />
          Ver Artigo Completo
        </Button>
      }
    >
      <div className="space-y-4">
        {selectedArticle.image_url && (
          <img
            src={selectedArticle.image_url}
            alt={selectedArticle.title}
            className="w-full h-48 object-cover rounded"
          />
        )}
        <p>
          <strong>Fonte:</strong> {selectedArticle.journal?.name ?? 'N/A'}
        </p>
        
        <div>
          <strong>Resumo:</strong>
          <div className="max-h-60 overflow-y-auto rounded bg-gray-50 dark:bg-gray-800 p-3 mt-1">
            {selectedArticle.summary ?? 'N/A'}
          </div>
        </div>

        <p>
          <strong>Publicado em:</strong> {formatDate(selectedArticle.published_at)}
        </p>


      </div>
    </ControlledDialog>
  )}

    </div>

    
  );
};

export default ArticlesTable;
