import json
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Key


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return str(o)
        return super(DecimalEncoder, self).default(o)


def lambda_handler(event, context):
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('obituary-30139727')

        response = table.scan()
        obituaries = response['Items']

        while 'LastEvaluatedKey' in response:
            response = table.scan(
                ExclusiveStartKey=response['LastEvaluatedKey'])
            obituaries.extend(response['Items'])

        sorted_orbituaries = sorted(obituaries, key=lambda x: x['timeCreated'])

        return {
            'statusCode': 200,
            'body': json.dumps(sorted_orbituaries, cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error retrieving obituaries -- {e}'
        }
