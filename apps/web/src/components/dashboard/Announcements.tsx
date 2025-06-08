// apps/web/src/components/dashboard/Announcements.tsx
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
  Skeleton,
  alpha,
  useTheme,
} from '@mui/material';
import { Bell as NotificationsIcon } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'success';
  date: string;
}

interface AnnouncementsProps {
  announcements: Announcement[];
  loading?: boolean;
}

export const Announcements = ({
  announcements,
  loading = false,
}: AnnouncementsProps) => {
  const theme = useTheme();

  const getAnnouncementColor = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.primary.main;
      case 'success':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
        borderRadius: 3,
        flex: 1,
        boxShadow: `2px 2px 6px ${alpha('#000', 0.3)}`,
        transition: 'transform .1s ease, box-shadow .1s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: `3px 3px 8px ${alpha('#000', 0.4)}`,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: { xs: '1.1rem', md: '1.25rem' },
          }}
        >
          <NotificationsIcon size={20} color={theme.palette.secondary.main} />
          Duyurular
        </Typography>

        {loading ? (
          Array.from(new Array(2)).map((_, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="60%" />
            </Box>
          ))
        ) : (
          <List disablePadding>
            {announcements.map((announcement, index) => (
              <ListItem
                key={announcement.id}
                disablePadding
                sx={{
                  mb: index < announcements.length - 1 ? 3 : 0,
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.7),
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.05)}`,
                  boxShadow: `1px 1px 3px ${alpha('#000', 0.2)}`,
                  transition: 'transform .2s ease, box-shadow .2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `2px 2px 6px ${alpha('#000', 0.3)}`,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: getAnnouncementColor(announcement.type),
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box component="div">
                      <Typography
                        component="div"
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        {announcement.title}
                      </Typography>
                      <Typography
                        component="div"
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {announcement.description}
                      </Typography>
                      <Chip
                        label={announcement.date}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          backgroundColor: alpha(
                            getAnnouncementColor(announcement.type),
                            0.1
                          ),
                          color: getAnnouncementColor(announcement.type),
                        }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
