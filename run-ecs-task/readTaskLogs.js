const AWS = require("aws-sdk");

async function readTaskLogs(logConfig, containerName, taskId) {
  let nextToken = null
  if (logConfig.logDriver !== 'awslogs') {
    throw new Error(`Unsupported log driver ${logConfig.logDriver}. Only 'awslogs' is supported`)
  }

  const cloudWatchLogs = new AWS.CloudWatchLogs()

  const params = {
    logGroupName: logConfig.options['awslogs-group'],
    logStreamName: `${logConfig.options['awslogs-stream-prefix']}/${containerName}/${taskId}`,
    startFromHead: true
  }

  const logs = []

  do {
    const {events, nextForwardToken} = await cloudWatchLogs.getLogEvents({
      ...params,
      nextToken: nextToken
    }).promise();
    if (events.length === 0) {
      break;
    }

    nextToken = nextForwardToken
    events.forEach(({message}) => logs.push(message))
  } while (nextToken)

  return logs
}

module.exports = readTaskLogs;

