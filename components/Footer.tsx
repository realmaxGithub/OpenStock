import { Link } from "@/i18n/routing";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import OpenDevSocietyBranding from "./OpenDevSocietyBranding";

const Footer = async () => {
    const t = await getTranslations('footer');
    return (
        <footer className="bg-gray-900 text-white border-t border-gray-800">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Image
                                src="/assets/images/logo.png"
                                alt="OpenStock"
                                width={150}
                                height={38}
                                className="brightness-0 invert"
                            />
                        </Link>
                        <p className="text-gray-400 mb-6 max-w-md">
                            {t('tagline')}
                        </p>
                        <div className="mb-8">
                            <Link href="/about" className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1 group">
                                {t('learnMission')}
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                        <div className="flex space-x-6">
                            <Link
                                href="https://github.com/Open-Dev-Society/OpenStock"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors duration-200 relative group"
                            >
                                <span className="relative">
                                    GitHub
                                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                                </span>
                            </Link>
                            <Link
                                href="https://www.linkedin.com/company/opendevsociety-in/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-400 transition-colors duration-200 relative group"
                            >
                                <span className="relative">
                                    LinkedIn
                                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
                                </span>
                            </Link>
                            <Link
                                href="https://discord.gg/JkJ8kfxgxB"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-600 transition-colors duration-200 relative group"
                            >
                                <span className="relative">
                                    Discord
                                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">{t('resources')}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/api-docs" className="text-gray-400 hover:text-white transition-colors duration-200 relative group">
                                    <span className="relative">
                                        {t('apiDocumentation')}
                                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/help" className="text-gray-400 hover:text-white transition-colors duration-200 relative group">
                                    <span className="relative">
                                        {t('helpCenter')}
                                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                                    </span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200 relative group">
                                    <span className="relative">
                                        {t('termsOfService')}
                                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        {/* Copyright */}
                        <div className="text-gray-400 text-sm mb-4 md:mb-0">
                            {t('copyright', { year: new Date().getFullYear() })}
                        </div>

                        {/* Open Dev Society Branding */}
                        <div className="flex items-center space-x-2">
                            <OpenDevSocietyBranding />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
