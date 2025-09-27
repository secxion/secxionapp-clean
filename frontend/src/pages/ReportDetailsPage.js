import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SummaryApi from '../common';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const ReportDetailsPage = () => {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReportDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(
          `${SummaryApi.fetchReportDetail.url}/${reportId}`,
          {
            method: SummaryApi.fetchReportDetail.method,
            credentials: 'include',
          },
        );

        if (!response.ok) {
          let errorMessage = 'Failed to fetch report details.';
          try {
            const errorText = await response.text();
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (jsonError) {
            console.error('Error parsing error JSON:', jsonError);
            errorMessage = `Failed to fetch report details. Status: ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.success && data.data) {
          setReport(data.data);
        } else {
          setError(data.message || 'Failed to fetch report details.');
        }
      } catch (err) {
        setError(
          err.message ||
            'An unexpected error occurred while fetching report details.',
        );
        toast.error(err.message || 'Could not fetch report details.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-gray-500 text-center py-10">Report not found.</div>
    );
  }

  return (
    <div className="container min-h-screen bg-gray-100 py-6 sm:py-12">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Report Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Information about your submitted report.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Report ID</dt>
              <dd className="mt-1 text-sm text-gray-900">{report._id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Submitted At
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(report.createdAt), 'yyyy-MM-dd HH:mm:ss')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.category}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.status}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Message</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.message}</dd>
            </div>
            {report.image && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Your Attachment
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <img
                    src={report.image}
                    alt="Report Attachment"
                    className="max-w-full h-auto rounded-md border"
                  />
                </dd>
              </div>
            )}
            {(report.adminReply || report.adminReplyImage) && (
              <div className="sm:col-span-2 border-t border-gray-200 pt-4">
                <dt className="text-sm font-medium text-blue-500">Reply</dt>
                {report.adminReply && (
                  <dd className="mt-1 text-sm text-gray-900">
                    {report.adminReply}
                  </dd>
                )}
                {report.adminReplyImage && (
                  <dd className="mt-2 text-sm text-gray-900">
                    <img
                      src={report.adminReplyImage}
                      alt="Admin Reply Attachment"
                      className="max-w-full h-auto rounded-md border"
                    />
                  </dd>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Replied At:{' '}
                  {format(new Date(report.updatedAt), 'yyyy-MM-dd HH:mm:ss')}
                </p>
              </div>
            )}
            {!report.adminReply &&
              !report.adminReplyImage &&
              report.status === 'Resolved' && (
                <div className="sm:col-span-2 border-t border-gray-200 pt-4">
                  <dt className="text-sm font-medium text-yellow-500">
                    Reply Pending Display
                  </dt>
                  <dd className="mt-1 text-sm text-gray-700">
                    The administrator's reply will be displayed here shortly.
                    Please refresh if you don't see it.
                  </dd>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsPage;
