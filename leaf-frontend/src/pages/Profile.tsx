import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { backendAPI } from '../services/backendService'
import { listAllowedProviders } from '../services/providerService'
import { getMySubscriptions, subscribe, unsubscribe } from '../services/notificationSubscriptionService'
import type { PageState } from '../models/PageState'
import type { ProfileResponse } from '../models/User'
import type { Provider } from '../models/Domain'

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 180, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  )
}

const ProfilePage = () => {
  const [pageState, setPageState] = useState<PageState<ProfileResponse>>({ isLoading: true })
  const [providers, setProviders] = useState<Provider[]>([])
  const [subscribedSlugs, setSubscribedSlugs] = useState<Set<string>>(new Set())
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true)
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null)
  const [toggleErrors, setToggleErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    backendAPI.getMyProfile().then(res => setPageState(res))

    Promise.all([listAllowedProviders(), getMySubscriptions()]).then(([providersRes, subsRes]) => {
      if (providersRes.data) setProviders(providersRes.data)
      else setSubscriptionsError(providersRes.errMsg ?? 'Erro ao carregar clínicas.')

      if (subsRes.data) setSubscribedSlugs(new Set(subsRes.data))
      else setSubscriptionsError(subsRes.errMsg ?? 'Erro ao carregar inscrições.')

      setSubscriptionsLoading(false)
    })
  }, [])

  const handleToggle = async (slug: string, checked: boolean) => {
    setToggleErrors(prev => ({ ...prev, [slug]: '' }))
    const wasSubscribed = subscribedSlugs.has(slug)

    setSubscribedSlugs(prev => {
      const next = new Set(prev)
      if (checked) next.add(slug)
      else next.delete(slug)
      return next
    })

    const res = checked ? await subscribe(slug) : await unsubscribe(slug)

    if (res.errMsg) {
      setSubscribedSlugs(prev => {
        const next = new Set(prev)
        if (wasSubscribed) next.add(slug)
        else next.delete(slug)
        return next
      })
      setToggleErrors(prev => ({ ...prev, [slug]: res.errMsg! }))
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Meu Perfil</Typography>

      {pageState.isLoading && <CircularProgress size={24} />}
      {pageState.errMsg && <Alert severity="error">{pageState.errMsg}</Alert>}

      {pageState.data && (
        <Card variant="outlined" sx={{ maxWidth: 560 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>{pageState.data.username}</Typography>
            <Divider sx={{ mb: 1 }} />
            <ProfileRow label="E-mail" value={pageState.data.email} />
            <ProfileRow label="E-mail confirmado" value={pageState.data.isEmailConfirmed ? 'Sim' : 'Não'} />
            <ProfileRow label="Cargo" value={pageState.data.roleName ?? 'Nenhuma'} />
            <ProfileRow label="Membro desde" value={new Date(pageState.data.createdAt).toLocaleDateString('pt-BR')} />
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Notificações por E-mail</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Receba notificações por e-mail sobre as clínicas selecionadas.
      </Typography>

      {subscriptionsLoading && <CircularProgress size={24} />}
      {subscriptionsError && <Alert severity="error">{subscriptionsError}</Alert>}

      {!subscriptionsLoading && !subscriptionsError && (
        providers.length === 0
          ? <Typography variant="body2" color="text.secondary">Nenhuma clínica disponível.</Typography>
          : (
            <Card variant="outlined" sx={{ maxWidth: 560 }}>
              <CardContent>
                <Stack spacing={1}>
                  {providers.map((provider, index) => (
                    <Box key={provider.slug}>
                      {index > 0 && <Divider sx={{ mb: 1 }} />}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={subscribedSlugs.has(provider.slug)}
                            onChange={(_, checked) => handleToggle(provider.slug, checked)}
                          />
                        }
                        label={provider.name}
                      />
                      {toggleErrors[provider.slug] && (
                        <Alert severity="error" sx={{ mt: 0.5 }}>{toggleErrors[provider.slug]}</Alert>
                      )}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )
      )}
    </Box>
  )
}

export default ProfilePage
