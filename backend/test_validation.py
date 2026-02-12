import unittest
from unittest.mock import MagicMock, patch
import json
import sys
import os
import asyncio

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from agent import generate_recommendations

class TestValidation(unittest.IsolatedAsyncioTestCase):
    @patch('agent.model')
    async def test_retry_logic_success(self, mock_model):
        # Mock responses: 2 failures then 1 success
        bad_response_1 = MagicMock()
        bad_response_1.text = "{}" # Empty JSON
        
        bad_response_2 = MagicMock()
        bad_response_2.text = '{"courses": []}' # Empty courses list
        
        good_response = MagicMock()
        good_response.text = json.dumps({
            "courses": [
                {
                    "title": "Test Course",
                    "description": "Test Description",
                    "category": "Mastering",
                    "topics": ["Topic 1"]
                }
            ]
        })
        
        mock_model.generate_content.side_effect = [bad_response_1, bad_response_2, good_response]
        
        print("\nRunning test_retry_logic_success...")
        result = await generate_recommendations("Test Role")
        
        self.assertIsNotNone(result)
        self.assertEqual(len(result["courses"]), 1)
        self.assertEqual(mock_model.generate_content.call_count, 3)
        print("test_retry_logic_success passed")

    @patch('agent.model')
    async def test_retry_logic_failure(self, mock_model):
        # Mock responses: all failures
        bad_response = MagicMock()
        bad_response.text = "{}"
        
        mock_model.generate_content.return_value = bad_response
        
        print("\nRunning test_retry_logic_failure...")
        result = await generate_recommendations("Test Role")
        
        self.assertIsNone(result)
        self.assertEqual(mock_model.generate_content.call_count, 3) # Max retries
        print("test_retry_logic_failure passed")

if __name__ == '__main__':
    unittest.main()
