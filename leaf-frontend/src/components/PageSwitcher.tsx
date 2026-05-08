import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useSearchParams } from 'react-router';

export interface Props {
  hasNextPage: boolean
}

function PageSwitcher({ hasNextPage }: Props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = searchParams.get("page")
  let pageNumber = 1
  if (page !== null) {
    try {
      pageNumber = parseInt(page) 
    } catch {}
  }

  function onPageChange(p: number) {
    searchParams.set("page", "" + p);
    setSearchParams(new URLSearchParams(searchParams))
  }

  return (
    <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center' }}>
      <Button size="small" variant="outlined" disabled={pageNumber <= 1} onClick={() => onPageChange(pageNumber - 1)}>
        Anterior
      </Button>
      <Typography variant="body2">Página {pageNumber}</Typography>
      <Button size="small" variant="outlined" disabled={!hasNextPage} onClick={() => onPageChange(pageNumber + 1)}>
        Próxima
      </Button>
    </Stack>
  )
}

export default PageSwitcher
