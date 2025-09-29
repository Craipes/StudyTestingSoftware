namespace StudyTestingSoftware.Services;

public class TestSessionAutoFinalizer : BackgroundService
{
    private readonly IServiceProvider services;
    private readonly TimeSpan interval = TimeSpan.FromSeconds(15);
    private const int BatchSize = 200;

    public TestSessionAutoFinalizer(IServiceProvider services)
    {
        this.services = services;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = services.CreateScope();
                var manager = scope.ServiceProvider.GetRequiredService<TestSessionManager>();
                await manager.FinalizeExpiredSessionsAsync(BatchSize, stoppingToken);
            }
            catch
            {
                // Intentionally swallow to keep the worker running. Log if you have logging configured.
            }

            try
            {
                await Task.Delay(interval, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                // shutting down
            }
        }
    }
}
