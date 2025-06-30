# Sentry Integration Setup

This document explains how to set up and use Sentry for event logging and error tracking in the wedding insurance application.

## Overview

The application now uses Sentry for comprehensive event logging and error tracking while maintaining compatibility with existing database entities. The integration provides:

- Real-time error monitoring and alerting
- Performance monitoring and tracing
- Event logging with structured data
- Automatic error grouping and deduplication
- User context and session tracking

## Configuration

### 1. Environment Variables

Add the following environment variable to your `.env` file:

```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
```

### 2. Get Your Sentry DSN

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project for your application
3. Copy the DSN from your project settings
4. Add it to your environment variables

## Architecture

### Services Structure

```
SentryService (New)
├── EventLoggerService (Updated)
├── SentryErrorService (Updated)
└── ScheduledTasksService (No changes needed)
```

### Key Features

1. **Dual Logging**: Events are sent to both Sentry and your database
2. **Error Tracking**: Automatic error capture with stack traces and context
3. **Performance Monitoring**: Request tracing and performance metrics
4. **User Context**: Automatic user identification and session tracking
5. **Data Sanitization**: Sensitive data is automatically redacted

## Usage

### Event Logging

```typescript
import { EventLoggerService } from './services/event-logger.service';

const eventLogger = EventLoggerService.getInstance();

// Log a system event
await eventLogger.logSystemEvent(
  'User registration',
  'New user registered successfully',
  EventLevel.INFO,
  { userId: '123', email: 'user@example.com' }
);

// Log an API call
await eventLogger.logApiCall(req, res, startTime, responseBody, error);
```

### Error Tracking

```typescript
import { SentryErrorService } from './services/sentry-error.service';

const sentryErrorService = SentryErrorService.getInstance();

// Capture an error
await sentryErrorService.captureRequestError(req, res, error, 500);

// Or capture a custom error
await sentryErrorService.captureError({
  errorType: 'ValidationError',
  errorMessage: 'Invalid email format',
  severity: ErrorSeverity.MEDIUM,
  userId: '123',
  additionalContext: { field: 'email', value: 'invalid-email' }
});
```

### Direct Sentry Usage

```typescript
import { SentryService } from './services/sentry.service';

const sentryService = SentryService.getInstance();

// Log an event directly
await sentryService.logEvent({
  eventType: EventType.API_CALL,
  action: 'GET /api/users',
  description: 'User list retrieved',
  userId: '123',
  level: EventLevel.INFO
});
```

## Features

### Automatic Features

1. **Request Tracking**: All HTTP requests are automatically tracked
2. **Error Capture**: Unhandled errors are automatically captured
3. **User Context**: User information is automatically attached to events
4. **Performance Monitoring**: Request timing and performance metrics
5. **Session Tracking**: User sessions are tracked automatically

### Manual Features

1. **Custom Events**: Log custom business events
2. **Error Context**: Add additional context to errors
3. **User Identification**: Set user context for tracking
4. **Custom Tags**: Add custom tags for filtering and grouping

## Database Integration

The system maintains your existing database entities:

- `EventLog`: Stores all events locally
- `SentryError`: Stores error information locally

This provides:
- Offline access to event data
- Custom reporting capabilities
- Data retention control
- Backup and recovery options

## Monitoring and Alerts

### Sentry Dashboard

Access your Sentry dashboard to:
- View real-time error rates
- Monitor performance metrics
- Set up alerts and notifications
- Analyze user sessions
- Track release health

### Local Monitoring

Use the existing admin routes to:
- View local event logs
- Monitor error statistics
- Generate custom reports
- Manage error status

## Best Practices

1. **Environment Configuration**: Use different DSNs for development and production
2. **Data Sanitization**: Sensitive data is automatically redacted
3. **Error Grouping**: Similar errors are automatically grouped
4. **Performance Impact**: Logging is non-blocking and optimized
5. **Retention Policy**: Old logs are automatically cleaned up

## Troubleshooting

### Common Issues

1. **Sentry not initializing**: Check your `SENTRY_DSN` environment variable
2. **Events not appearing**: Verify your internet connection and DSN validity
3. **Performance issues**: Check if too many events are being logged
4. **Missing context**: Ensure user authentication is working properly

### Debug Mode

In development mode, events are also logged to the console for debugging:

```bash
[SENTRY EVENT] API_CALL: GET /api/users
```

## Migration from Custom Logging

The existing services have been updated to use Sentry while maintaining the same API:

- `EventLoggerService`: Now delegates to SentryService
- `SentryErrorService`: Now delegates to SentryService
- All existing method signatures remain the same
- Database entities are unchanged

No code changes are required in your existing application code. 