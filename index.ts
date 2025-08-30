class Logger {
  private log(level: "INFO" | "ERROR", message: string) {
    const timestamp = new Date().toISOString();
    console.log(`[${level}] ${timestamp}: ${message}`);
  }

  info(message: string) {
    this.log("INFO", message);
  }

  error(message: string) {
    this.log("ERROR", message);
  }
}

const logger = new Logger();

const urlsToFetch: string[] = [process.env.CHESS_BACKEND_URL!];

async function fetchAllUrls() {
  logger.info("Starting to fetch URLs...");

  const fetchPromises = urlsToFetch.map(async (url) => {
    try {
      const response = await fetch(url);
      logger.info(`SUCCESS: Hit ${url} - Status: ${response.status}`);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`ERROR: Failed to hit ${url} - ${error.message}`);
      } else {
        logger.error(`ERROR: An unknown error occurred while hitting ${url}`);
      }
    }
  });

  await Promise.all(fetchPromises);
  logger.info("Finished fetching all URLs for this interval.");
}

const TEN_MINUTES_IN_MS = 1000;

fetchAllUrls();

setInterval(fetchAllUrls, TEN_MINUTES_IN_MS);

Bun.serve({
  port: 3000,
  fetch(request) {
    logger.info(`Received request for: ${request.url}`);
    return new Response(
      "URL polling service is active. Check the console for logs."
    );
  },
});

logger.info("Backend server started on http://localhost:3000");
logger.info(`Will hit ${urlsToFetch.length} URLs every 10 minutes.`);
