CREATE TABLE `export_reports` (
`id` int AUTO_INCREMENT NOT NULL,
`projectId` int NOT NULL,
`userId` int NOT NULL,
`markdownContent` text,
`pdfKey` varchar(512),
`pdfUrl` varchar(2048),
`generatedAt` timestamp NOT NULL DEFAULT (now()),
`createdAt` timestamp NOT NULL DEFAULT (now()),
CONSTRAINT `export_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `export_reports_projectId_idx` ON `export_reports` (`projectId`);
--> statement-breakpoint
CREATE INDEX `export_reports_userId_idx` ON `export_reports` (`userId`);
