import { Typography, type Theme } from '@mui/material';
import Paper from '@mui/material/Paper'
import type { Lead } from '../../models/Domain'


interface Props {
  lead: Lead
  theme: Theme
}

function LeadCard({ lead, theme }: Props) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 1.5,
        cursor: 'pointer',
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': { bgcolor: 'action.hover' },
        borderRadius: 1,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
        {lead.name}
      </Typography>
      {lead.description && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {lead.description}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.5 }}>
        {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.5 }}>
        {`Criado por: ${lead.createdByUserName}`}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.5 }}>
        {`Responsável: ${lead.assignedToUserName}`}
      </Typography>
    </Paper>
  )
}

export default LeadCard
