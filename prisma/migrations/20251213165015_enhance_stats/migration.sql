-- CreateTable
CREATE TABLE "analytics_event" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitorId" TEXT,
    "sessionId" TEXT,
    "noticeId" TEXT,
    "path" TEXT,
    "pageCategory" TEXT,
    "referrer" TEXT,
    "browser" TEXT,
    "browserVer" TEXT,
    "os" TEXT,
    "deviceType" TEXT,
    "durationMs" INTEGER,
    "meta" JSONB,

    CONSTRAINT "analytics_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notice_daily_summary" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "medianDurationMs" INTEGER,
    "avgDurationMs" INTEGER,
    "topReferrer" TEXT,

    CONSTRAINT "notice_daily_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notice_weekly_summary" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "avgDurationMs" INTEGER,

    CONSTRAINT "notice_weekly_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_daily_summary" (
    "id" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "totalPageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "uniqueSessions" INTEGER NOT NULL DEFAULT 0,
    "avgSessionDurationMs" INTEGER,
    "homeViews" INTEGER NOT NULL DEFAULT 0,
    "noticeViews" INTEGER NOT NULL DEFAULT 0,
    "aboutViews" INTEGER NOT NULL DEFAULT 0,
    "dashboardViews" INTEGER NOT NULL DEFAULT 0,
    "otherViews" INTEGER NOT NULL DEFAULT 0,
    "cookieAccepts" INTEGER NOT NULL DEFAULT 0,
    "cookieRejects" INTEGER NOT NULL DEFAULT 0,
    "desktopVisitors" INTEGER NOT NULL DEFAULT 0,
    "mobileVisitors" INTEGER NOT NULL DEFAULT 0,
    "tabletVisitors" INTEGER NOT NULL DEFAULT 0,
    "topReferrers" JSONB,
    "browserStats" JSONB,

    CONSTRAINT "site_daily_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_weekly_summary" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "totalPageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "uniqueSessions" INTEGER NOT NULL DEFAULT 0,
    "avgSessionDurationMs" INTEGER,
    "homeViews" INTEGER NOT NULL DEFAULT 0,
    "noticeViews" INTEGER NOT NULL DEFAULT 0,
    "aboutViews" INTEGER NOT NULL DEFAULT 0,
    "dashboardViews" INTEGER NOT NULL DEFAULT 0,
    "otherViews" INTEGER NOT NULL DEFAULT 0,
    "cookieAccepts" INTEGER NOT NULL DEFAULT 0,
    "cookieRejects" INTEGER NOT NULL DEFAULT 0,
    "desktopVisitors" INTEGER NOT NULL DEFAULT 0,
    "mobileVisitors" INTEGER NOT NULL DEFAULT 0,
    "tabletVisitors" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "site_weekly_summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_event_eventType_timestamp_idx" ON "analytics_event"("eventType", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_event_noticeId_timestamp_idx" ON "analytics_event"("noticeId", "timestamp");

-- CreateIndex
CREATE INDEX "analytics_event_visitorId_idx" ON "analytics_event"("visitorId");

-- CreateIndex
CREATE INDEX "analytics_event_timestamp_idx" ON "analytics_event"("timestamp");

-- CreateIndex
CREATE INDEX "analytics_event_path_idx" ON "analytics_event"("path");

-- CreateIndex
CREATE INDEX "analytics_event_pageCategory_timestamp_idx" ON "analytics_event"("pageCategory", "timestamp");

-- CreateIndex
CREATE INDEX "notice_daily_summary_day_idx" ON "notice_daily_summary"("day");

-- CreateIndex
CREATE UNIQUE INDEX "notice_daily_summary_noticeId_day_key" ON "notice_daily_summary"("noticeId", "day");

-- CreateIndex
CREATE INDEX "notice_weekly_summary_weekStart_idx" ON "notice_weekly_summary"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "notice_weekly_summary_noticeId_weekStart_key" ON "notice_weekly_summary"("noticeId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "site_daily_summary_day_key" ON "site_daily_summary"("day");

-- CreateIndex
CREATE UNIQUE INDEX "site_weekly_summary_weekStart_key" ON "site_weekly_summary"("weekStart");
